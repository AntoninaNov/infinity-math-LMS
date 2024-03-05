// middlewares/errorHandler.js
const logger = require('../config/logger.config');

const errorHandler = (err, req, res, next) => {
    // Log the error internally
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // Respond to the client
    if (err.isOperational) {
        // Operational, trusted error: send message to client
        res.status(err.status || 500).json({
            error: {
                message: err.message || 'An unexpected error occurred',
            },
        });
    } else {
        // Programming or other unknown error: don't leak details to client
        // Log error
        console.error('ERROR 💥:', err);
        // Send generic message
        res.status(500).json({
            error: {
                message: 'Something went wrong!',
            },
        });
    }
};

module.exports = errorHandler;
