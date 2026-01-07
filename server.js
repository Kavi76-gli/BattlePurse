require("dotenv").config();
console.log("RUNNING SERVER FROM:", __filename);

if (process.env.EMAIL_HOST === "127.0.0.1" || process.env.EMAIL_HOST === "localhost") {
  throw new Error("❌ Local SMTP is forbidden in production");
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
process.setMaxListeners(20);

/* ======================
   ENV DEBUG (SAFE LOGS)
====================== */
console.log("APP PORT =", process.env.PORT);
console.log("JWT SECRET EXISTS:", !!process.env.JWT_SECRET);

/* ======================
   REQUIRED ENV CHECK
====================== */
if (!process.env.PORT) {
  console.error("❌ PORT missing in .env");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ======================
   STATIC FILES
====================== */
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

// ✅ Ensure all upload folders exist
const uploadFolders = ["avatars", "qr", "poster"];
uploadFolders.forEach(folder => {
  const dirPath = path.resolve(__dirname, "uploads", folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created uploads/${folder} directory`);
  }
});

// Serve uploads
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
console.log("📂 Uploads folder served at /uploads");

/* ======================
   API ROUTES
====================== */
app.use("/api/wallet", require("./routes/wallet")); // Wallet & poster routes
// TODO: Add other route imports like user, tournaments, payment-config etc.

/* ======================
   FRONTEND ENTRY
====================== */
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
  res.status(404).json({ success: false, msg: "Route not found" });
});

/* ======================
   DATABASE CONNECT
====================== */
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ======================
   START SERVER
====================== */
const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
