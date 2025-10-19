require("dotenv").config;
const { Client } = require("pg");

const connection = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "rohit1234",
  database: "lotwiseDB",
});

connection
  .connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

module.exports = connection;
