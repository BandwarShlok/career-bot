import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fullname: String,
    email: String,
    phone: String,
    plan: String,
    price: Number,
    paymentStatus: String
  },
  { timestamps: true }   // 🔥 REQUIRED
);

export default mongoose.model("Plan", planSchema);
  