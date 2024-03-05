const dotenv = require("dotenv");
const mongoose = require("mongoose");
const logger = require('./logger.config');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info("Mongoose successfully connected to the database"))
    .catch(err => logger.error("Mongoose connection error: " + err));

mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to the database");
});

mongoose.connection.on("error", (err) => {
  logger.error("Mongoose connection error: " + err);
});

mongoose.connection.on("disconnected", () => {
  logger.info("Mongoose disconnected");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    logger.info("Mongoose connection closed due to application termination");
    process.exit(0);
  });
});
