const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    status: {
      type: String,
      enum: ["pending", "matched", "accepted", "en_route", "arrived", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    isUrgent: { type: Boolean, default: false },
    scheduledAt: { type: Date },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    problem: { type: String },
    price: { type: Number },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
    otp: { type: String },
    rating: { type: Number },
    review: { type: String },
    estimatedArrival: { type: Date },
    completedAt: { type: Date },
    trackingUpdates: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        location: { lat: Number, lng: Number },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
