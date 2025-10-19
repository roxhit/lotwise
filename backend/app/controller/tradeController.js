const db = require("../config/database");
const { producer, connectProducer } = require("../config/kafka");

async function addTrade(req, res) {
  try {
    console.log("Received request body:", req.body);

    await connectProducer();
    console.log("Kafka producer connected");

    const { symbol, qty, price, ts } = req.body;

    if (!symbol || typeof qty !== "number" || typeof price !== "number") {
      return res.status(400).json({
        error: "symbol, qty (number), and price (number) are required",
      });
    }

    const query = `
      INSERT INTO trades (symbol, qty, price, ts)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await db.query(query, [
      symbol,
      qty,
      price,
      ts || new Date(),
    ]);
    const trade = result.rows[0];
    console.log("Trade inserted into DB:", trade);

    await producer.send({
      topic: "trades-topic",
      messages: [{ value: JSON.stringify(trade) }],
    });
    console.log("Trade sent to Kafka");

    res.status(201).json({ trade, message: "Trade published to Kafka" });
  } catch (error) {
    console.error("Error adding trade:", error);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
}

async function getPositions(req, res) {
  try {
    const query = `
      SELECT 
        symbol,
        SUM(remaining_qty) AS qty,
        ROUND(AVG(cost_per_unit)::numeric, 2) AS avg_price
      FROM lots
      WHERE remaining_qty > 0
      GROUP BY symbol
      ORDER BY symbol;
    `;
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getPnL(req, res) {
  try {
    const query = `
      SELECT 
        symbol,
        ROUND(buy_cost_per_unit::numeric, 2) AS buy_price,
        ROUND(sell_price_per_unit::numeric, 2) AS sell_price,
        qty,
        ROUND(pnl::numeric, 2) AS pnl
      FROM realized_pnl
      ORDER BY symbol;
    `;
    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching PnL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = { addTrade, getPositions, getPnL };
