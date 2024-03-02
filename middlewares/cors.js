const cors = require('cors');

// CORS options
const corsOptions = {
    origin: '*', //Allow requests from any origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Allowed HTTP headers
    optionsSuccessStatus: 200,
};

// Middleware to use CORS with predefined options
const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
