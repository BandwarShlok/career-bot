app.post("/counselling", async (req, res) => {
  try {
    const { fullname, email, phone, plan, price } = req.body;

    // 1️⃣ Save plan in database
    const newPlan = new Plan({
      fullname,
      email,
      phone,
      plan,
      price,
      paymentStatus: "PAID"
    });

    await newPlan.save();

    // 2️⃣ Prepare SMS message
    const message = `Hi ${fullname}, your plan "${plan}" has been booked successfully. Thank you for choosing Career Compass.`;

    // 3️⃣ Send SMS via Fast2SMS
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        numbers: phone
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // 4️⃣ Send success response
    res.json({
      message: "Your plan has been booked successfully. SMS sent."
    });

  } catch (error) {
    console.log("FAST2SMS ERROR:", error.message);
    res.status(500).json({
      message: "Plan booked, but SMS could not be sent"
    });
  }
});
