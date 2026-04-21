const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// Create booking
router.post("/", protect, async (req, res) => {
  try {
    const { serviceId, isUrgent, address, problem, scheduledAt } = req.body;

    // AI quick match: find best available provider
    const providers = await Provider.find({ services: serviceId, isAvailable: true })
      .sort({ rating: -1, responseTime: 1 })
      .limit(1);

    const provider = providers[0] || null;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const estimatedArrival = new Date(Date.now() + (isUrgent ? 30 : 60) * 60 * 1000);

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      provider: provider?._id,
      isUrgent,
      address,
      problem,
      scheduledAt: scheduledAt || new Date(),
      otp,
      estimatedArrival,
      status: provider ? "matched" : "pending",
      trackingUpdates: [
        {
          status: provider ? "matched" : "pending",
          message: provider
            ? `Provider ${provider._id} matched! Estimated arrival: ${estimatedArrival.toLocaleTimeString()}`
            : "Looking for the best provider near you...",
        },
      ],
    });

    // Add to user bookings
    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

    // Notify via socket
    const io = req.app.get("io");
    io.emit("new_booking", { bookingId: booking._id, serviceId, isUrgent });

    const populated = await Booking.findById(booking._id)
      .populate("service", "name category icon basePrice")
      .populate({ path: "provider", populate: { path: "user", select: "name avatar phone" } });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("service", "name category icon basePrice estimatedTime")
      .populate({ path: "provider", populate: { path: "user", select: "name avatar phone" } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single booking
router.get("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("service", "name category icon basePrice estimatedTime")
      .populate({ path: "provider", populate: { path: "user", select: "name avatar phone" } })
      .populate("user", "name phone address");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update booking status
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status, message } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    booking.trackingUpdates.push({ status, message: message || `Status updated to ${status}` });
    if (status === "completed") booking.completedAt = new Date();
    await booking.save();

    const io = req.app.get("io");
    io.to(`booking_${booking._id}`).emit("status_changed", { status, message });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rate booking
router.post("/:id/rate", protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { rating, review },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
