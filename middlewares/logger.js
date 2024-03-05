const logger = require('../config/logger.config');

const httpLogger = (req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
};

module.exports = httpLogger;
