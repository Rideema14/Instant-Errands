const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect, adminOnly } = require("../middleware/auth");

// Get all services
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const services = await Service.find(filter);
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single service
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create service (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed default services
router.post("/seed", async (req, res) => {
  try {
    await Service.deleteMany({});
    const defaults = [
      { name: "AC Installation & Repair", category: "AC Repair", basePrice: 499, estimatedTime: 90, isUrgent: true, description: "Fast AC repair by certified technicians", icon: "❄️", tags: ["cooling", "hvac", "urgent"] },
      { name: "Emergency Plumbing", category: "Plumbing", basePrice: 399, estimatedTime: 60, isUrgent: true, description: "Leak fix, pipe repair, drain cleaning", icon: "🔧", tags: ["leak", "pipe", "drain", "urgent"] },
      { name: "Pickup & Delivery Laundry", category: "Laundry", basePrice: 199, estimatedTime: 480, isUrgent: false, description: "Wash, dry & fold with doorstep delivery", icon: "👕", tags: ["wash", "fold", "delivery"] },
      { name: "Home Grooming for Men", category: "Grooming", basePrice: 299, estimatedTime: 45, isUrgent: false, description: "Haircut, beard trim at your home", icon: "✂️", tags: ["haircut", "beard", "salon"] },
      { name: "Electrical Repair", category: "Electrical", basePrice: 349, estimatedTime: 60, isUrgent: true, description: "Wiring, switches, short circuits fixed fast", icon: "⚡", tags: ["wiring", "switch", "urgent"] },
      { name: "Deep House Cleaning", category: "Cleaning", basePrice: 599, estimatedTime: 180, isUrgent: false, description: "Full home deep clean by trained staff", icon: "🧹", tags: ["deep clean", "sanitize"] },
      { name: "Carpentry & Furniture Repair", category: "Carpentry", basePrice: 449, estimatedTime: 120, isUrgent: false, description: "Fix furniture, install shelves, woodwork", icon: "🪚", tags: ["furniture", "wood", "repair"] },
      { name: "Pest Control", category: "Pest Control", basePrice: 799, estimatedTime: 120, isUrgent: true, description: "Cockroach, termite, rodent control", icon: "🐛", tags: ["cockroach", "termite", "rodent"] },
    ];
    const services = await Service.insertMany(defaults);
    res.json({ message: "Services seeded", count: services.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
