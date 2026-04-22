const express = require("express");
const router = express.Router();
const Provider = require("../models/Provider");
const { protect } = require("../middleware/auth");

// Get all providers (optionally filter by service category)
router.get("/", async (req, res) => {
  try {
    const providers = await Provider.find({ isAvailable: true })
      .populate("user", "name avatar phone")
      .populate("services", "name category")
      .sort({ rating: -1 });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get top-rated providers for a service
router.get("/match/:serviceId", async (req, res) => {
  try {
    const providers = await Provider.find({
      services: req.params.serviceId,
      isAvailable: true,
    })
      .populate("user", "name avatar phone")
      .populate("services", "name category icon")
      .sort({ rating: -1, responseTime: 1 })
      .limit(5);
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single provider
router.get("/:id", async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate("user", "name avatar phone email")
      .populate("services", "name category icon basePrice");
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update provider availability
router.put("/availability", protect, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    provider.isAvailable = req.body.isAvailable;
    await provider.save();
    res.json({ isAvailable: provider.isAvailable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update own provider profile (bio, services, pricing)
router.put("/profile", protect, async (req, res) => {
  try {
    if (req.user.role !== "provider")
      return res.status(403).json({ message: "Provider access required" });
    const { bio, experience, pricePerHour, responseTime, videoPreviewUrl, services } = req.body;
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) return res.status(404).json({ message: "Provider profile not found" });
    if (bio !== undefined) provider.bio = bio;
    if (experience !== undefined) provider.experience = Number(experience);
    if (pricePerHour !== undefined) provider.pricePerHour = Number(pricePerHour);
    if (responseTime !== undefined) provider.responseTime = Number(responseTime);
    if (videoPreviewUrl !== undefined) provider.videoPreviewUrl = videoPreviewUrl;
    if (services) provider.services = services;
    await provider.save();
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review
router.post("/:id/review", protect, async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    const { rating, comment } = req.body;
    provider.reviews.push({ user: req.user._id, rating, comment });
    provider.totalReviews = provider.reviews.length;
    provider.rating =
      provider.reviews.reduce((sum, r) => sum + r.rating, 0) / provider.totalReviews;
    await provider.save();
    res.json({ message: "Review added", rating: provider.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
