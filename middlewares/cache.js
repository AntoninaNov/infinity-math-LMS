const { getAsync, setAsync } = require('../config/redis.config.js');

// Cache middleware for specific routes
const checkCache = (req, res, next) => {
    const { id } = req.params;

    getAsync(id).then((data) => {
        if (data != null) {
            res.send(JSON.parse(data));
        } else {
            next();
        }
    });
};

module.exports = { checkCache };
