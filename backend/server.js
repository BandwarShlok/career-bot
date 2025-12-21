import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Plan from "./models/plan.js";
import TestResult from "./models/TestResult.js";
import { OAuth2Client } from "google-auth-library";

const app = express();
app.use(express.json());
app.use(cors());

const client = new OAuth2Client(
  "893185406114-bihm2bqb7pcpp44qhbjonsi7rk0uqjek.apps.googleusercontent.com"
);

/* ================= DATABASE ================= */
mongoose
  .connect("mongodb://127.0.0.1:27017/careerbot")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

/* ================= HELPERS ================= */
const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.json({ message: "Registration successful", user: safeUser(user) });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
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

    res.json({ message: "Login successful", user: safeUser(user) });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GOOGLE LOGIN ================= */
app.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ message: "Token missing" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "893185406114-bihm2bqb7pcpp44qhbjonsi7rk0uqjek.apps.googleusercontent.com"
    });

    const { email, name, sub } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      const hashed = await bcrypt.hash(sub, 10);
      user = await User.create({ name, email, password: hashed });
    }

    res.json({ message: "Google login successful", user: safeUser(user) });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ message: "Google login failed" });
  }
});

/* ================= COUNSELLING ================= */
app.post("/counselling", async (req, res) => {
  try {
    const { userId, fullname, email, phone, plan, price } = req.body;
    if (!userId)
      return res.status(400).json({ message: "User not logged in" });

    await Plan.create({
      userId,
      fullname,
      email,
      phone,
      plan,
      price,
      paymentStatus: "PAID"
    });

    res.json({ message: "Plan booked successfully" });
  } catch (err) {
    console.error("COUNSELLING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SAVE TEST ================= */
app.post("/save-test", async (req, res) => {
  try {
    const { userId, testName, score } = req.body;
    if (!userId || !testName || score === undefined)
      return res.status(400).json({ message: "Missing fields" });

    await TestResult.create({
      userId,
      testName,
      score,
      createdAt: new Date()
    });

    res.json({ message: "Test saved successfully" });
  } catch (err) {
    console.error("TEST SAVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET USER TESTS ================= */
app.get("/my-tests/:userId", async (req, res) => {
  try {
    const tests = await TestResult.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    console.error("TEST FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET USER PLANS ================= */
app.get("/my-plans/:userId", async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error("PLAN FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
