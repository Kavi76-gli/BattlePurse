// ============================================================
// BATTLEPURSE SERVER
// ============================================================

require("dotenv").config();

console.log("==========================================");
console.log("🚀 BATTLEPURSE SERVER STARTING");
console.log("==========================================");
console.log("📂 Server file:", __filename);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

process.setMaxListeners(20);

// ============================================================
// ENVIRONMENT CHECK
// ============================================================

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing in .env");
  process.exit(1);
}

// ============================================================
// PATHS
// ============================================================

const publicPath = path.resolve(__dirname, "public");
const uploadBase = path.resolve(__dirname, "uploads");

console.log("📁 Public path:", publicPath);
console.log("📁 Upload path:", uploadBase);

// ============================================================
// CHECK PUBLIC FOLDER
// ============================================================

if (!fs.existsSync(publicPath)) {
  console.error("❌ Public folder not found:");
  console.error(publicPath);
  process.exit(1);
}

const indexPath = path.join(publicPath, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error("❌ index.html not found:");
  console.error(indexPath);
  process.exit(1);
}

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// JSON body
app.use(
  express.json({
    limit: "50mb"
  })
);

// URL encoded body
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb"
  })
);

// ============================================================
// UPLOAD FOLDERS
// ============================================================

const uploadDirs = [
  "avatars",
  "poster",
  "qr",
  "logo"
];

if (!fs.existsSync(uploadBase)) {
  fs.mkdirSync(uploadBase, {
    recursive: true
  });

  console.log("📁 Created uploads folder");
}

uploadDirs.forEach((folder) => {
  const dirPath = path.join(uploadBase, folder);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {
      recursive: true
    });

    console.log(`📁 Created uploads/${folder}`);
  }
});

// ============================================================
// STATIC FRONTEND
// ============================================================
//
// Everything inside /public is automatically available.
//
// Example:
//
// public/index.html
//       ↓
// http://localhost:5000/
//
// public/auth.html
//       ↓
// http://localhost:5000/auth.html
//
// public/gamezone.html
//       ↓
// http://localhost:5000/gamezone.html
//
// ============================================================

app.use(
  express.static(publicPath)
);

console.log("🌐 Frontend folder:", publicPath);

// ============================================================
// STATIC UPLOAD FILES
// ============================================================
//
// Example:
//
// uploads/logo/logo.png
//       ↓
// /uploads/logo/logo.png
//
// ============================================================

app.use(
  "/uploads",
  express.static(uploadBase)
);

console.log("📂 Uploads available at /uploads");

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BattlePurse API is running",
    status: "online",
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// API ROUTES
// ============================================================

try {
  const walletRoutes = require("./routes/wallet");

  app.use(
    "/api/wallet",
    walletRoutes
  );

  console.log("🔗 Wallet API loaded at /api/wallet");

} catch (err) {

  console.error("❌ Failed to load wallet routes");
  console.error(err);

  process.exit(1);
}

// ============================================================
// FRONTEND HOME PAGE
// ============================================================
//
// https://battlepurse.onrender.com
//                  ↓
//          public/index.html
//
// ============================================================

app.get("/", (req, res) => {

  res.sendFile(indexPath, (err) => {

    if (err) {
      console.error("❌ Failed to send index.html:", err.message);

      if (!res.headersSent) {
        res.status(500).send("Unable to load BattlePurse");
      }
    }

  });

});

// ============================================================
// API 404 HANDLER
// ============================================================
//
// IMPORTANT:
// This comes after all API routes.
//
// ============================================================

app.use("/api", (req, res) => {

  res.status(404).json({
    success: false,
    msg: "API route not found",
    path: req.originalUrl
  });

});

// ============================================================
// GENERAL 404 HANDLER
// ============================================================

app.use((req, res) => {

  res.status(404).send("Page not found");

});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {

  console.error("==========================================");
  console.error("❌ SERVER ERROR");
  console.error("==========================================");
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    msg: "Internal server error"
  });

});

// ============================================================
// MONGODB CONNECTION
// ============================================================

console.log("🔄 Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  })

  .then(() => {

    console.log("==========================================");
    console.log("✅ MongoDB connected");
    console.log("==========================================");

  })

  .catch((err) => {

    console.error("==========================================");
    console.error("❌ MONGODB CONNECTION ERROR");
    console.error("==========================================");
    console.error(err.message);

    process.exit(1);

  });

// ============================================================
// START SERVER
// ============================================================
//
// Render automatically provides process.env.PORT.
//
// Local:
// http://localhost:5000
//
// Render:
// https://battlepurse.onrender.com
//
// ============================================================

const PORT = Number(
  process.env.PORT || 5000
);

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log("==========================================");
    console.log("🚀 BATTLEPURSE SERVER ONLINE");
    console.log("==========================================");
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🏠 Home: http://localhost:${PORT}/`);
    console.log(`🔐 API: http://localhost:${PORT}/api/wallet`);
    console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
    console.log("==========================================");

  }
);