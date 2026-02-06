const { Queue } = require("bullmq");
const redisConnection = require("../connection/redis");

const paymentQueue = new Queue("payment-queue", {
  connection: redisConnection,
});

module.exports = paymentQueue;
