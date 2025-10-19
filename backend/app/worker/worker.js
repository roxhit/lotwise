const consumer = require("../config/kafkaConsumer");
const db = require("../config/database");

async function startWorker() {
  await consumer.connect();
  await consumer.subscribe({ topic: "trades-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const trade = JSON.parse(message.value.toString());
      console.log("Received Trade:", trade);
    },
  });
}

startWorker().catch((error) => {
  console.error("Error in worker:", error);
});
