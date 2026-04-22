/**
 * Seed script — creates demo accounts + services
 * Run: node backend/scripts/seed.js
 *
 * Passwords are plain-text here; User.create() triggers the
 * pre('save') bcrypt hook so they are stored hashed correctly.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ── Connect first, then require models (avoids stale connection issues)
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB:", mongoose.connection.host);

  // Require after connection so indexes are registered cleanly
  const User     = require("../models/User");
  const Provider = require("../models/Provider");
  const Service  = require("../models/Service");

  // ── Wipe existing demo data ──────────────────────────────────────────
  const demoEmails = [
    "admin@quickserve.in",
    "provider@quickserve.in",
    "user@quickserve.in",
  ];

  // Remove providers linked to demo users before removing users
  for (const email of demoEmails) {
    const u = await User.findOne({ email });
    if (u) {
      await Provider.deleteOne({ user: u._id });
      await User.deleteOne({ _id: u._id });
      console.log(`🗑  Removed old demo user: ${email}`);
    }
  }

  await Service.deleteMany({});
  console.log("🗑  Cleared services");

  // ── Seed Services ────────────────────────────────────────────────────
  const SERVICES = [
    { name: "AC Installation & Repair", category: "AC Repair",    basePrice: 499, estimatedTime: 90,  isUrgent: true,  description: "Fast AC repair by certified technicians",       icon: "❄️", tags: ["cooling","hvac","urgent"] },
    { name: "Emergency Plumbing",       category: "Plumbing",     basePrice: 399, estimatedTime: 60,  isUrgent: true,  description: "Leak fix, pipe repair, drain cleaning",         icon: "🔧", tags: ["leak","pipe","drain","urgent"] },
    { name: "Pickup & Delivery Laundry",category: "Laundry",      basePrice: 199, estimatedTime: 480, isUrgent: false, description: "Wash, dry & fold with doorstep delivery",       icon: "👕", tags: ["wash","fold","delivery"] },
    { name: "Home Grooming for Men",    category: "Grooming",     basePrice: 299, estimatedTime: 45,  isUrgent: false, description: "Haircut, beard trim at your home",              icon: "✂️", tags: ["haircut","beard","salon"] },
    { name: "Electrical Repair",        category: "Electrical",   basePrice: 349, estimatedTime: 60,  isUrgent: true,  description: "Wiring, switches, short circuits fixed fast",  icon: "⚡", tags: ["wiring","switch","urgent"] },
    { name: "Deep House Cleaning",      category: "Cleaning",     basePrice: 599, estimatedTime: 180, isUrgent: false, description: "Full home deep clean by trained staff",         icon: "🧹", tags: ["deep clean","sanitize"] },
    { name: "Carpentry & Furniture Repair", category: "Carpentry",basePrice: 449, estimatedTime: 120, isUrgent: false, description: "Fix furniture, install shelves, woodwork",     icon: "🪚", tags: ["furniture","wood","repair"] },
    { name: "Pest Control",             category: "Pest Control", basePrice: 799, estimatedTime: 120, isUrgent: true,  description: "Cockroach, termite, rodent control",           icon: "🐛", tags: ["cockroach","termite","rodent"] },
  ];

  const services = await Service.insertMany(SERVICES);
  console.log(`✅ Seeded ${services.length} services`);

  // ── Seed Users (using .create() so pre('save') hash runs) ───────────
  const PASSWORD = "password123";

  // 1. Admin
  const admin = await User.create({
    name: "Admin User",
    email: "admin@quickserve.in",
    password: PASSWORD,
    phone: "9000000001",
    role: "admin",
    isActive: true,
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 2. Provider (KYC pre-approved)
  const providerUser = await User.create({
    name: "Rahul Sharma",
    email: "provider@quickserve.in",
    password: PASSWORD,
    phone: "9000000002",
    role: "provider",
    isActive: true,
    kyc: {
      docType:   "aadhaar",
      docNumber: "123456789012",
      status:    "approved",
      submittedAt: new Date(),
      reviewedAt:  new Date(),
    },
  });

  await Provider.create({
    user:         providerUser._id,
    services:     services.slice(0, 4).map(s => s._id),
    bio:          "Experienced professional with 5+ years in home services. Reliable, fast, and affordable.",
    experience:   5,
    pricePerHour: 350,
    responseTime: 12,
    isVerified:   true,
    isAvailable:  true,
    completedJobs: 48,
    rating:        4.8,
    totalReviews:  32,
  });
  console.log(`✅ Provider created: ${providerUser.email}`);

  // 3. Customer
  const customer = await User.create({
    name: "Priya Singh",
    email: "user@quickserve.in",
    password: PASSWORD,
    phone: "9000000003",
    role: "customer",
    isActive: true,
  });
  console.log(`✅ Customer created: ${customer.email}`);

  // ── Quick sanity check: verify bcrypt comparison works ───────────────
  const check = await User.findOne({ email: "admin@quickserve.in" });
  const ok    = await check.matchPassword(PASSWORD);
  console.log(`\n🔐 Password hash check: ${ok ? "PASS ✅" : "FAIL ❌"}`);

  console.log("\n─────────────────────────────────────────");
  console.log("🎉 Seed complete! Demo login credentials:");
  console.log("─────────────────────────────────────────");
  console.log("  Role      Email                       Password");
  console.log("  admin     admin@quickserve.in         password123");
  console.log("  provider  provider@quickserve.in      password123");
  console.log("  customer  user@quickserve.in          password123");
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Seed failed:", err.message);
  console.error(err);
  process.exit(1);
});
