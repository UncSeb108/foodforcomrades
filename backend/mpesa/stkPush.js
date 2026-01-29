const axios = require("axios");
const generateAccessToken = require("./accessToken");
const normalizePhone = require("../lib/normalizePhone.js");

// Helper to generate timestamp in YYYYMMDDHHMMSS format
const getTimestamp = () => {
  const now = new Date();
  return (
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0")
  );
};

// Helper to generate Base64-encoded password for M-Pesa
const generatePassword = (timestamp) => {
  const shortCode = process.env.MPESA_PAYBILL;
  const passkey = process.env.MPESA_PASSKEY;
  return Buffer.from(shortCode + passkey + timestamp).toString("base64");
};

module.exports = async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const parsedAmount = parseInt(amount);

    if (!phone || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ error: "Valid phone and amount are required." });
    }

    // Normalize phone to Safaricom expected format (e.g., 2547XXXXXXXX)
    const normalizedPhone = normalizePhone(phone, { format: "mpesa" });

    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);
    const token = await generateAccessToken();

    const payload = {
      BusinessShortCode: process.env.MPESA_PAYBILL,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: parsedAmount,
      PartyA: normalizedPhone,
      PartyB: process.env.MPESA_PAYBILL,
      PhoneNumber: normalizedPhone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: "FeedTheirFuture",
      TransactionDesc: "Donation",
    };

    console.log("Sending STK Push payload:", payload);

    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("STK Push initiated:", response.data);

    res.status(200).json({
      message: "STK push initiated successfully",
      data: response.data,
    });
  } catch (error) {
    const safError = error.response?.data || error.message || "Unknown error";
    console.error("STK Push Error:", safError);

    res.status(500).json({
      error: "Failed to initiate STK push.",
      details: safError,
    });
  }
};
