const redis = require('redis');
const { promisify } = require('util');

// Connect to Redis
const client = redis.createClient({
    host: 'localhost',
    port: 6379,
});

client.on('error', (err) => console.log('Redis Client Error', err));

// Promisify the get and set functions for async/await usage
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

module.exports = { getAsync, setAsync };
