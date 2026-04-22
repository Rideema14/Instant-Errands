const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const { protect, adminOnly } = require("../middleware/auth");

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ── Dashboard Stats ───────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalProviders, totalCustomers, totalBookings, totalServices,
      pendingKYC, approvedKYC, rejectedKYC,
      completedBookings, pendingBookings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "provider" }),
      User.countDocuments({ role: "customer" }),
      Booking.countDocuments(),
      Service.countDocuments(),
      User.countDocuments({ role: "provider", "kyc.status": "pending" }),
      User.countDocuments({ role: "provider", "kyc.status": "approved" }),
      User.countDocuments({ role: "provider", "kyc.status": "rejected" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "pending" }),
    ]);

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate("user", "name email")
      .populate("service", "name category");

    res.json({
      totalUsers, totalProviders, totalCustomers,
      totalBookings, totalServices,
      kyc: { pending: pendingKYC, approved: approvedKYC, rejected: rejectedKYC },
      bookings: { completed: completedBookings, pending: pendingBookings },
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── List All Users (filterable) ───────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const { role, kycStatus, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter["kyc.status"] = kycStatus;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Single User (full detail) ─────────────────────────────────────
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    let providerProfile = null;
    if (user.role === "provider") {
      providerProfile = await Provider.findOne({ user: user._id })
        .populate("services", "name category icon basePrice");
    }
    const bookings = await Booking.find({ user: user._id })
      .populate("service", "name category").sort({ createdAt: -1 }).limit(10);
    res.json({ user, providerProfile, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Review KYC ────────────────────────────────────────────────────────
router.put("/kyc/:userId/review", async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: "approve" | "reject"
    if (!["approve", "reject"].includes(action))
      return res.status(400).json({ message: 'Action must be "approve" or "reject"' });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "provider")
      return res.status(400).json({ message: "KYC only applies to providers" });
    if (user.kyc.status !== "pending")
      return res.status(400).json({ message: "KYC is not in pending state" });

    user.kyc.status = action === "approve" ? "approved" : "rejected";
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.user._id;
    if (action === "reject") user.kyc.rejectionReason = rejectionReason || "Documents could not be verified";

    // If approved, also mark the Provider profile as verified
    if (action === "approve") {
      await Provider.findOneAndUpdate({ user: user._id }, { isVerified: true });
    }

    await user.save();
    res.json({ message: `KYC ${action}d successfully`, kyc: user.kyc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Toggle User Active Status ─────────────────────────────────────────
router.put("/users/:id/toggle-active", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot disable admin accounts" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "enabled" : "disabled"}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── All Bookings ──────────────────────────────────────────────────────
router.get("/bookings", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate("service", "name category icon")
      .populate({ path: "provider", populate: { path: "user", select: "name phone" } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Pending KYC list ──────────────────────────────────────────────────
router.get("/kyc/pending", async (req, res) => {
  try {
    const users = await User.find({ role: "provider", "kyc.status": "pending" })
      .select("-password").sort({ "kyc.submittedAt": 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
