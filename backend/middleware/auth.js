const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) return res.status(401).json({ message: "User not found" });
      if (!req.user.isActive) return res.status(403).json({ message: "Account disabled" });
      next();
    } catch {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ message: "Admin access required" });
};

const providerOnly = (req, res, next) => {
  if (req.user?.role === "provider") return next();
  res.status(403).json({ message: "Provider access required" });
};

const kycApproved = (req, res, next) => {
  if (req.user?.role !== "provider") return next();
  if (req.user?.kyc?.status !== "approved") {
    return res.status(403).json({ message: "KYC verification required before accessing this feature" });
  }
  next();
};

module.exports = { protect, adminOnly, providerOnly, kycApproved };
