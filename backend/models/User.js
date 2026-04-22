const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String, default: "" },

    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },

    kyc: {
      // null is valid (no doc chosen yet) — don't put it in enum, just allow it
      docType:       { type: String, enum: ["aadhaar", "pan"], default: undefined },
      docNumber:     { type: String, default: "" },
      docFrontImage: { type: String, default: "" },
      docBackImage:  { type: String, default: "" },
      selfieImage:   { type: String, default: "" },
      status: {
        type: String,
        enum: ["not_submitted", "pending", "approved", "rejected"],
        default: "not_submitted",
      },
      rejectionReason: { type: String, default: "" },
      submittedAt:  { type: Date },
      reviewedAt:   { type: Date },
      reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
