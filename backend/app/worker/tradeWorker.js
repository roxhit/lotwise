const consumer = require("../config/kafkaConsumer");
const db = require("../config/database");

async function processTrades(trade) {
  const { id: trade_id, symbol } = trade;
  const qty = Number(trade.qty);
  const price = Number(trade.price);

  if (isNaN(qty) || isNaN(price)) {
    console.error("Invalid numeric values in trade:", trade);
    return;
  }

  if (qty > 0) {
    // BUY → Create a new lot
    await db.query(
      `INSERT INTO lots (trade_id, symbol, original_qty, remaining_qty, cost_per_unit)
       VALUES ($1, $2, $3, $3, $4)`,
      [trade_id, symbol, qty, price]
    );
  } else {
    // SELL → Apply FIFO and calculate realized P&L
    let remainingSell = Math.abs(qty);
    const { rows: lots } = await db.query(
      `SELECT * FROM lots WHERE symbol=$1 AND remaining_qty>0 ORDER BY created_at ASC`,
      [symbol]
    );

    for (const lot of lots) {
      if (remainingSell <= 0) break;

      const sellQty = Math.min(remainingSell, lot.remaining_qty);
      const realizedPnl = sellQty * (price - lot.cost_per_unit);

      await db.query(
        `UPDATE lots SET remaining_qty = remaining_qty - $1 WHERE id=$2`,
        [sellQty, lot.id]
      );

      await db.query(
        `INSERT INTO realized_pnl
          (sell_trade_id, lot_id, symbol, qty, buy_cost_per_unit, sell_price_per_unit, pnl)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          trade_id,
          lot.id,
          symbol,
          sellQty,
          lot.cost_per_unit,
          price,
          realizedPnl,
        ]
      );

      remainingSell -= sellQty;
    }

    if (remainingSell > 0) {
      console.warn(
        `Warning: Sell trade ${trade_id} has ${remainingSell} units unmatched (no open lots left)`
      );
    }
  }
}

async function startTradeWorker() {
  await consumer.connect();
  await consumer.subscribe({ topic: "trades-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const trade = JSON.parse(message.value.toString());
      console.log("Processing trade:", trade);
      await processTrades(trade);
    },
  });
}

startTradeWorker().catch((error) => {
  console.error("Error in trade worker:", error);
});
