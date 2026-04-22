const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, `../uploads/${folder}`);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${req.user._id}_${file.fieldname}_${Date.now()}${ext}`);
    },
  });

const imageFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Only image files are allowed (jpg, png, webp)"), false);
};

// For avatar uploads
const uploadAvatar = multer({
  storage: storage("avatars"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("avatar");

// For KYC document uploads (front, back, selfie)
const uploadKYC = multer({
  storage: storage("kyc"),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
}).fields([
  { name: "docFront", maxCount: 1 },
  { name: "docBack",  maxCount: 1 },
  { name: "selfie",   maxCount: 1 },
]);

module.exports = { uploadAvatar, uploadKYC };
