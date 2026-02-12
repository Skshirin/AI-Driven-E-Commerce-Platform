import { errorhandler, errorMiddleware } from "../middlewares/errorMiddleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import { sendToken } from "../utils/jwtToken.js";
import {generateResetPasswordToken} from "../utils/generateResetPasswordToken.js";
import { generateForgotPasswordEmailTemplate } from "../utils/generateForgotPasswordEmailTemplate.js";
import {sendEmail} from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

export const register = catchAsyncError(async (req,res,next) =>{
    const {name,email,password} = req.body;
    if(password.length < 8 || password.length > 16){
        return next(new errorhandler("Password must be between 8 and 16 characters",400));
    }
    if(!name || !email || !password){
        return next(new errorhandler("Please enter all fields",400));
    };
    const isAlreadyRegistered = await database.query
    (`SELECT * FROM users WHERE email = $1`, 
        [email]
    );
    if(isAlreadyRegistered.rows.length > 0){
        return next(new errorhandler("User already registered",400));
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await database.query
    (`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`, 
        [name, email, hashedPassword]
    );
    sendToken(user.rows[0],201,"Registered Successfully",res);
});

export const login = catchAsyncError(async (req,res,next) =>{
    const {email,password} = req.body;
    if(!email || !password){
        return next(new errorhandler("Please enter all fields",400));
    }
    const user = await database.query
    (`SELECT * FROM users WHERE email = $1`,
        [email]
    );
    if(user.rows.length === 0){
        return next(new errorhandler("Invalid email or password",400));
    }
    const isPasswordMatched = await bcrypt.compare(password,user.rows[0].password);
    if(!isPasswordMatched){
        return next(new errorhandler("Invalid email or password",400));
    }
    sendToken(user.rows[0],200,"Logged in Successfully",res);
    
});

export const getUser = catchAsyncError(async (req,res,next) =>{
    const { user } = req;
    res.status(200).json({
        success: true,
        user
    });
});

export const logout = catchAsyncError(async (req,res,next) =>{
    res.status(200).cookie("token","",{
        expires: new Date(Date.now()),
        httpOnly: true
    }).json({
        success: true,
        message: "Logged out successfully"
    });
});

export const forgotPassword = catchAsyncError(async (req,res,next) =>{
    const { email } = req.body;
    const { frontendUrl } = req.body;
    let userResult = await database.query
        (`SELECT * FROM users WHERE email = $1`,
        [email]
    );
    if(userResult.rows.length === 0){
        return next(new errorhandler("User not found with this email",404));
    }
    const user = userResult.rows[0];
    const { resetToken, hashedToken, resetPasswordExpireTime } =
        generateResetPasswordToken();

    await database.query(
        `UPDATE users SET reset_password_token = $1,
         reset_password_expire = to_timestamp($2) WHERE email = $3`,
        [hashedToken, resetPasswordExpireTime / 1000, email]
    );
    
    const resetPasswordUrl = `${frontendUrl}/password/reset/${resetToken}`;

    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

    try{
        await sendEmail({
            email: user.email,
            subject: "Ecommerce Password Recovery",
            message,
        });
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    }
    catch(error){
        console.log("EMAIL ERROR:", error);
        await database.query(
            `UPDATE users SET reset_password_token = NULL,
             reset_password_expire = NULL WHERE email = $1`,
            [email]
        );
        return next(new errorhandler("Email could not be sent",500));
    }
});

export const resetPassword = catchAsyncError(async (req,res,next) =>{
    const { token } = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await database.query(
        `SELECT * FROM users WHERE reset_password_token = $1
         AND reset_password_expire > NOW()`,
        [resetPasswordToken]
    );
    if(user.rows.length === 0){
        return next(new errorhandler("Invalid or expired reset token",400));
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new errorhandler("Password does not match",400));
    }
    if(req.body.password?.length < 8
    || req.body.password?.length > 16
    || req.body.confirmPassword?.length < 8
    || req.body.confirmPassword?.length > 16){
        return next(new errorhandler("Password must be between 8 and 16 characters",400));
    }

    const hashedPassword = await bcrypt.hash(req.body.password,10);

    const updatedUser = await database.query(
        `UPDATE users SET password = $1,
         reset_password_token = NULL,
         reset_password_expire = NULL WHERE id = $2 RETURNING *`,
        [hashedPassword, user.rows[0].id]
    );
    sendToken(updatedUser.rows[0],200,"Password reset successfully",res);
});

export const updatePassword = catchAsyncError(async (req,res,next) =>{
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if(!currentPassword || !newPassword || !confirmNewPassword){
        return next(new errorhandler("Please enter all fields",400));
    }
    const isPasswordMatched = await bcrypt.compare(currentPassword, req.user.password);
    if(!isPasswordMatched){
        return next(new errorhandler("Current password is incorrect",400));
    }
    if(newPassword !== confirmNewPassword){
        return next(new errorhandler("New password and confirm new password do not match",400));
    }
    if(newPassword?.length < 8
    || newPassword?.length > 16
    || confirmNewPassword?.length < 8
    || confirmNewPassword?.length > 16){
        return next(new errorhandler("Password must be between 8 and 16 characters",400));
    }
    const hashedPassword = await bcrypt.hash(newPassword,10);
    await database.query(
        `UPDATE users SET password = $1 WHERE id = $2`,
        [hashedPassword, req.user.id]
    );
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }
  if (name.trim().length === 0 || email.trim().length === 0) {
    return next(new ErrorHandler("Name and email cannot be empty.", 400));
  }
  let avatarData = {};
  if (req.files && req.files.avatar) {
    const { avatar } = req.files;
    if (req.user?.avatar?.public_id) {
      await cloudinary.uploader.destroy(req.user.avatar.public_id);
    }

    const newProfileImage = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      {
        folder: "Ecommerce_Avatars",
        width: 150,
        crop: "scale",
      }
    );
    avatarData = {
      public_id: newProfileImage.public_id,
      url: newProfileImage.secure_url,
    };
  }

  let user;
  if (Object.keys(avatarData).length === 0) {
    user = await database.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, req.user.id]
    );
  } else {
    user = await database.query(
      "UPDATE users SET name = $1, email = $2, avatar = $3 WHERE id = $4 RETURNING *",
      [name, email, avatarData, req.user.id]
    );
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: user.rows[0],
  });
});