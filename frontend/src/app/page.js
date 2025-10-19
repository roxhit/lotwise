"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Target, DollarSign } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function PortfolioTracker() {
  const [currentPage, setCurrentPage] = useState("trades");
  const [positions, setPositions] = useState([]);
  const [pnl, setPnl] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    symbol: "",
    qty: "",
    price: "",
  });

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/positions`);
      const data = await res.json();
      setPositions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setMessage("Failed to fetch positions");
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPnL = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/pnl`);
      const data = await res.json();
      setPnl(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching P&L:", error);
      setMessage("Failed to fetch P&L");
      setPnl([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitTrade = async () => {
    setMessage("");

    if (!formData.symbol || !formData.qty || !formData.price) {
      setMessage("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/add-trade/trades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: formData.symbol.toUpperCase(),
          qty: parseFloat(formData.qty),
          price: parseFloat(formData.price),
          ts: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add trade");
      }

      setMessage("✓ Trade added successfully!");
      setFormData({ symbol: "", qty: "", price: "" });

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error adding trade:", error);
      setMessage("✗ Error adding trade");
    }
  };

  useEffect(() => {
    if (currentPage === "positions") {
      fetchPositions();
    } else if (currentPage === "pnl") {
      fetchPnL();
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white text-xl font-bold">📈</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Portfolio Tracker
                </h1>
                <p className="text-xs text-slate-400">Lotwise FIFO System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setCurrentPage("trades")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                currentPage === "trades"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Add Trade
            </button>
            <button
              onClick={() => setCurrentPage("positions")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                currentPage === "positions"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Open Positions
            </button>
            <button
              onClick={() => setCurrentPage("pnl")}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                currentPage === "pnl"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Realized P&L
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {currentPage === "trades" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-green-400" />
                Record Trade
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Symbol
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder="e.g., AAPL, GOOGL"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quantity (+ for buy, - for sell)
                  </label>
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleInputChange}
                    placeholder="e.g., 100 or -50"
                    step="0.01"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price per Unit ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 150.50"
                    step="0.01"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSubmitTrade}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Submit Trade
                </button>
              </div>

              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                    message.includes("✓")
                      ? "bg-green-900/30 text-green-300 border border-green-700"
                      : "bg-red-900/30 text-red-300 border border-red-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
              <h3 className="text-lg font-bold text-white mb-4">
                How it works
              </h3>
              <div className="space-y-4 text-slate-300 text-sm">
                <div className="flex gap-3">
                  <div className="bg-green-900/30 text-green-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white">Buy Orders</p>
                    <p className="text-xs">
                      Enter positive quantity to create a new lot
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-red-900/30 text-red-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white">Sell Orders</p>
                    <p className="text-xs">
                      Enter negative quantity to close lots (FIFO)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-blue-900/30 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white">Track Results</p>
                    <p className="text-xs">
                      View positions and realized P&L in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === "positions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-400" />
                Open Positions
              </h2>
              <button
                onClick={fetchPositions}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-blue-400"></div>
              </div>
            ) : positions.length === 0 ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
                <p className="text-slate-400">No open positions yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {positions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 rounded-lg border border-slate-700 p-6"
                  >
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Symbol</p>
                        <p className="text-white font-bold text-lg">
                          {pos.symbol}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Quantity</p>
                        <p className="text-white font-semibold">{pos.qty}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Avg Cost</p>
                        <p className="text-white font-semibold">
                          ${parseFloat(pos.avg_price).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">
                          Position Value
                        </p>
                        <p className="text-blue-400 font-semibold">
                          ${(pos.qty * pos.avg_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === "pnl" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-400" />
                Realized P&L
              </h2>
              <button
                onClick={fetchPnL}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-blue-400"></div>
              </div>
            ) : pnl.length === 0 ? (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
                <p className="text-slate-400">No realized P&L yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pnl.map((trade, idx) => {
                  const isProfit = trade.pnl >= 0;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-800 rounded-lg border border-slate-700 p-6"
                    >
                      <div className="grid md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Symbol</p>
                          <p className="text-white font-bold text-lg">
                            {trade.symbol}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            Buy Price
                          </p>
                          <p className="text-white font-semibold">
                            ${parseFloat(trade.buy_price).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            Sell Price
                          </p>
                          <p className="text-white font-semibold">
                            ${parseFloat(trade.sell_price).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            Quantity
                          </p>
                          <p className="text-white font-semibold">
                            {trade.qty}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">P&L</p>
                          <div className="flex items-center gap-2">
                            {isProfit ? (
                              <ArrowUpRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4 text-red-400" />
                            )}
                            <p
                              className={`font-bold text-lg ${
                                isProfit ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              ${parseFloat(trade.pnl).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
