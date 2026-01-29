require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const stkPush = require("./mpesa/stkPush");
const callbackHandler = require("./mpesa/callback");
const register = require("./auth/register");
const login = require("./auth/login");

const app = express();

// Middleware
app.use(helmet());

// Explicit CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});
app.use(morgan("combined"));
app.use(compression());
app.use(express.json());

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", apiLimiter);

// Routes
app.post("/api/donate", (req, res, next) => {
  console.log("Received donation request:", req.body);
  stkPush(req, res, next);
});
app.post("/api/register", register);
app.post("/api/login", login);
app.post("/api/callback", callbackHandler);
app.use("/api/receipts", express.static("receipts"));

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
