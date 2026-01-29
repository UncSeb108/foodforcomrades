const supabase = require("../lib/supabaseClient");
const sendSMS = require("../lib/sms");
const normalizePhone = require("../lib/normalizePhone.js");
const generateReceipt = require("../lib/generateReceipt");

const callbackHandler = async (req, res) => {
  console.log("M-Pesa callback received:", JSON.stringify(req.body, null, 2));

  const callback = req.body?.Body?.stkCallback;

  if (!callback || typeof callback !== "object") {
    console.warn("Invalid callback structure");
    return res.status(400).json({ message: "Invalid callback payload" });
  }

  const { ResultCode, CallbackMetadata, ResultDesc } = callback;

  if (ResultCode === 0) {
    const amount = CallbackMetadata?.Item?.find(
      (i) => i.Name === "Amount"
    )?.Value;
    const phone = CallbackMetadata?.Item?.find(
      (i) => i.Name === "PhoneNumber"
    )?.Value;
    const receipt = CallbackMetadata?.Item?.find(
      (i) => i.Name === "MpesaReceiptNumber"
    )?.Value;

    if (!amount || !phone || !receipt) {
      console.warn("Missing metadata: ", { amount, phone, receipt });
      return res.status(400).json({ message: "Incomplete donation data" });
    }

    const normalizedPhone = normalizePhone(phone);

    console.log(
      `Donation of KES ${amount} from ${normalizedPhone} | Receipt: ${receipt}`
    );

    const { data: existing, error: checkError } = await supabase
      .from("donations")
      .select("id")
      .eq("receipt_number", receipt)
      .maybeSingle();

    if (existing) {
      console.log("Duplicate receipt detected — skipping insert.");
      return res.status(200).json({ message: "Duplicate donation ignored." });
    }

    const { error } = await supabase
      .from("donations")
      .insert([{ amount, phone: normalizedPhone, receipt_number: receipt }]);

    if (error) {
      console.error("Failed to save donation to Supabase:", error.message);
      return res.status(500).json({ message: "Error saving donation" });
    }

    console.log("Donation saved to Supabase");

    // Generate the donation receipt
    try {
      await generateReceipt({
        name: "Anonymous",
        amount,
        receipt,
        date: new Date(),
      });
      console.log("PDF receipt generated");
    } catch (pdfErr) {
      console.warn("PDF generation failed:", pdfErr.message);
    }

    // Send SMS with receipt download link
    try {
      const receiptUrl = `https://feedacomrade-xvzyr.ondigitalocean.app/api/receipts/receipt_${receipt}.pdf`;
      const message = `Thank you for donating KES ${amount}. Download your receipt here: ${receiptUrl}`;
      const smsRes = await sendSMS(normalizedPhone, message);
      console.log("SMS sent:", smsRes);
    } catch (smsError) {
      console.warn("Failed to send SMS:", smsError.message || smsError);
    }

    console.log("Donation processed successfully");

    // Respond with downloadable receipt URL
    return res.status(200).json({
      message: "Donation saved and receipt generated.",
      receipt_url: `/api/receipts/receipt_${receipt}.pdf`,
    });
  } else {
    console.log(`M-Pesa transaction failed or canceled: ${ResultDesc}`);
  }

  res.status(200).json({ message: "Callback processed successfully." });
};

module.exports = callbackHandler;
