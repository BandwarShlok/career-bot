import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";

import User from "./models/User.js";
import Plan from "./models/plan.js";
import TestResult from "./models/TestResult.js";

const app = express();
app.use(express.json());
app.use(cors());

/* ================= DATABASE ================= */

mongoose
  .connect("mongodb://127.0.0.1:27017/careerbot")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

/* ================= REGISTER ================= */

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    res.json({ message: "Registration successful", user });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Incorrect password" });

    res.json({ message: "Login successful", user });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= COUNSELLING (SAVE PLAN – USER SPECIFIC) ================= */

app.post("/counselling", async (req, res) => {
  try {
    // 🔍 DEBUG: SEE WHAT BACKEND RECEIVES
    console.log("BACKEND RECEIVED BODY:", req.body);

    const { userId, fullname, email, phone, plan, price } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User not logged in" });
    }

    const newPlan = new Plan({
      userId,
      fullname,
      email,
      phone,
      plan,
      price,
      paymentStatus: "PAID"
    });

    await newPlan.save();

    console.log("📩 SMS SENT (SIMULATED)");
    console.log(`To: ${phone}`);
    console.log(
      `Message: Hi ${fullname}, your plan "${plan}" has been booked successfully.`
    );

    res.json({ message: "Your plan has been booked successfully." });

  } catch (err) {
    console.error("COUNSELLING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
/* ================= SAVE TEST RESULT ================= */

app.post("/save-test", async (req, res) => {
  try {
    const { userId, testName, score } = req.body;

    if (!userId || !testName || score === undefined) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await TestResult.findOne({ userId, testName });

    if (existing) {
      existing.score = score;
      existing.date = new Date();
      await existing.save();
      return res.json({ message: "Test updated" });
    }

    const test = new TestResult({ userId, testName, score });
    await test.save();

    res.json({ message: "Test saved" });

  } catch (err) {
    console.error("TEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET LOGGED-IN USER PLANS ================= */

app.get("/my-plans/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const plans = await Plan.find({ userId }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET LOGGED-IN USER TEST RESULTS ================= */

app.get("/my-tests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const tests = await TestResult.find({ userId }).sort({ date: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
