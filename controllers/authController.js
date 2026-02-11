import { errorhandler, errorMiddleware } from "../middlewares/errorMiddleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import { sendToken } from "../utils/jwtToken.js";
import bcrypt from "bcryptjs";

export const register = catchAsyncError(async (req,res,next) =>{
    const {name,email,password} = req.body;
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