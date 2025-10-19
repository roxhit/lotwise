const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "lotwise-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "lotwise-group" });

module.exports = consumer;
