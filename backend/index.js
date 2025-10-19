const express = require("express");
const db = require("./app/config/database");
const bodyParser = require("body-parser");
const app = express();
const tradeRouter = require("./app/router/tradeRouter");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use(cors());
app.use(bodyParser.json());
app.use("/add-trade", tradeRouter);
app.use("/api", tradeRouter);
app.use("/trades", tradeRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = app;
