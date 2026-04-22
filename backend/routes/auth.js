const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("../models/User");
const Provider = require("../models/Provider");
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../config/upload");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const safeUser = (u) => ({
  _id: u._id, name: u.name, email: u.email,
  phone: u.phone, role: u.role, avatar: u.avatar,
  kyc: u.kyc, address: u.address, isActive: u.isActive,
});

// ── Register ─────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Only allow customer or provider self-registration; admins are created manually
    const allowedRoles = ["customer", "provider"];
    const finalRole = allowedRoles.includes(role) ? role : "customer";

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone, role: finalRole });

    // If provider, also create a Provider profile
    if (finalRole === "provider") {
      await Provider.create({ user: user._id });
    }

    res.status(201).json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isActive)
      return res.status(403).json({ message: "Your account has been disabled. Contact support." });

    res.json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get My Profile ────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  let providerProfile = null;
  if (user.role === "provider") {
    providerProfile = await Provider.findOne({ user: user._id }).populate("services", "name category icon basePrice");
  }
  res.json({ ...safeUser(user), providerProfile });
});

// ── Update Profile (name, phone, address) ────────────────────────────
router.put("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, address } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    await user.save();
    res.json(safeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Upload Avatar ─────────────────────────────────────────────────────
router.post("/avatar", protect, (req, res) => {
  uploadAvatar(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findById(req.user._id);
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    res.json({ avatar: user.avatar });
  });
});

// ── Submit KYC (providers only) ───────────────────────────────────────
router.post("/kyc", protect, (req, res) => {
  if (req.user.role !== "provider")
    return res.status(403).json({ message: "Only providers need KYC verification" });

  const { uploadKYC } = require("../config/upload");
  uploadKYC(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    const { docType, docNumber } = req.body;
    if (!docType || !docNumber)
      return res.status(400).json({ message: "Document type and number are required" });

    // Validate doc number format
    if (docType === "aadhaar" && !/^\d{12}$/.test(docNumber))
      return res.status(400).json({ message: "Aadhaar number must be exactly 12 digits" });
    if (docType === "pan" && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(docNumber.toUpperCase()))
      return res.status(400).json({ message: "Invalid PAN format (e.g. ABCDE1234F)" });

    if (!req.files?.docFront?.[0])
      return res.status(400).json({ message: "Front image of document is required" });
    if (!req.files?.selfie?.[0])
      return res.status(400).json({ message: "Selfie photo is required" });

    const user = await User.findById(req.user._id);
    user.kyc = {
      docType,
      docNumber: docType === "pan" ? docNumber.toUpperCase() : docNumber,
      docFrontImage: `/uploads/kyc/${req.files.docFront[0].filename}`,
      docBackImage:  req.files.docBack ? `/uploads/kyc/${req.files.docBack[0].filename}` : "",
      selfieImage:   `/uploads/kyc/${req.files.selfie[0].filename}`,
      status: "pending",
      submittedAt: new Date(),
    };
    await user.save();
    res.json({ message: "KYC submitted successfully. Pending admin review.", kyc: user.kyc });
  });
});

module.exports = router;
