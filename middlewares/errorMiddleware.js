class errorhandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export { errorhandler }; // ADD THIS EXPORT

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    
    if (err.code === 11000) {
        const message = "Duplicate field value entered";
        err = new errorhandler(message, 400);
    }
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid Json Web Token";
        err = new errorhandler(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = "Json Web Token is expired";
        err = new errorhandler(message, 400);
    }

    const errorMessage = err.errors 
    ? Object.values(err.errors)
        .map((value) => value.message)
        .join(", ") 
    : err.message;

    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
}