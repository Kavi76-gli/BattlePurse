require("dotenv").config();
console.log("RUNNING SERVER FROM:", __filename);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
process.setMaxListeners(20);

/* ======================
   ENV CHECK
====================== */
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
   STATIC FRONTEND
====================== */
const publicPath = path.resolve(__dirname, "public");
app.use(express.static(publicPath));

/* ======================
   ENSURE UPLOAD FOLDERS
====================== */
const uploadBase = path.resolve(__dirname, "uploads");


const uploadDirs = ["avatars", "poster", "qr", "logo"];

uploadDirs.forEach(folder => {
  const dirPath = path.join(uploadBase, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created uploads/${folder}`);
  }
});

/* ======================
   STATIC UPLOAD FILES (VERY IMPORTANT)
====================== */
app.use("/uploads", express.static(uploadBase));
console.log("📂 Uploads available at /uploads");

/* ======================
   API ROUTES
====================== */
app.use("/api/wallet", require("./routes/wallet"));

/* ======================
   FRONTEND ENTRY
====================== */
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* ======================
   404 HANDLER (ALWAYS LAST)
====================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    msg: "Route not found"
  });
});

/* ======================
   DATABASE CONNECT
====================== */
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

/* ======================
   START SERVER
====================== */
const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
