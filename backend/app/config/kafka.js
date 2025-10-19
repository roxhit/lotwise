const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "lotwise-producer",
  brokers: ["localhost:9092"],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log("Kafka Producer connected");
}

module.exports = { kafka, producer, connectProducer };
