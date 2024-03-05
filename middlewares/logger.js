const logger = require('../config/logger.config');

const httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
};


module.exports = httpLogger;
