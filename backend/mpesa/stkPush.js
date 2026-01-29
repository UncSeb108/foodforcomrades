const axios = require("axios");

const generateAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error(
      "Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in .env"
    );
    throw new Error("Missing M-Pesa API credentials");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  try {
    console.log("Requesting token with:");
    console.log("   MPESA_CONSUMER_KEY:", consumerKey);
    console.log("   MPESA_CONSUMER_SECRET:", consumerSecret);
    console.log("   Encoded Basic Auth:", auth);

    const response = await axios.get(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Access Token received:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Failed to generate access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate access token");
  }
};

module.exports = generateAccessToken;
