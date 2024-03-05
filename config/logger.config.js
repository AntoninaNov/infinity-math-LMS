const winston = require('winston');
const path = require('path');

// Define custom logging levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
};

// Define which levels to show based on the running environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Define different formats for different transports
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // to print stack trace
    winston.format.splat(),
    winston.format.json()
);

// Setting up transports (console, file)
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }),
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format,
    }),
    new winston.transports.File({ filename: 'logs/all.log', format }),
];

// Create the loggerConfig
const loggerConfig = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

module.exports = loggerConfig;
