import jwt from 'jsonwebtoken';
import { catchAsyncError } from './catchAsyncError.js';
import { errorhandler } from './errorMiddleware.js';
import database from '../database/db.js';

export const isAuthenticated = catchAsyncError(async (req,res,next) =>{
    const { token } = req.cookies;
    if(!token){
        return next(new errorhandler("Please login to access this resource",401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await database.query
    (`SELECT * FROM users WHERE id = $1 LIMIT 1`,
        [decodedData.id]
    );
    req.user = user.rows[0];
    next();
});

export const authorizedRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next
            (new errorhandler
                (`Role: ${req.user.role} is not allowed to access this resource`,403)
            );
        }
        next();
    };
};
