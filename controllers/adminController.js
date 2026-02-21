import { errorhandler, errorMiddleware } from "../middlewares/errorMiddleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";

export const getAllUsers = catchAsyncError(async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;

    const totalUsersResult = await database.query(
        "SELECT COUNT(*) FROM users WHERE role = $1", 
        ['user']
    );

    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    const offset = (page - 1) * 10;

    const users = await database.query(
        `SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, 
        ['user', 10, offset]
    );

    res.status(200).json({
        success: true,
        totalUsers,
        currentPage: page,
        users: users.rows,
    });

});
