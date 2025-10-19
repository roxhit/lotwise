const express = require("express");
const router = express.Router();
const tradeController = require("../controller/tradeController");

router.post("/trades", tradeController.addTrade);
router.get("/positions", tradeController.getPositions);
router.get("/pnl", tradeController.getPnL);

module.exports = router;
