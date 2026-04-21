const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["AC Repair", "Plumbing", "Laundry", "Grooming", "Electrical", "Cleaning", "Carpentry", "Pest Control"],
      required: true,
    },
    description: { type: String },
    icon: { type: String },
    basePrice: { type: Number, required: true },
    estimatedTime: { type: Number, default: 60 }, // minutes
    isUrgent: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
