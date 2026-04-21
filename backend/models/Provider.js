const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    bio: { type: String },
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    videoPreviewUrl: { type: String },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },
    completedJobs: { type: Number, default: 0 },
    responseTime: { type: Number, default: 15 }, // minutes
    pricePerHour: { type: Number, default: 300 },
    badges: [{ type: String }],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Provider", providerSchema);
