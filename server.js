


require("dotenv").config();
console.log("RUNNING SERVER FROM:", __filename);
if (process.env.EMAIL_HOST === "127.0.0.1" || process.env.EMAIL_HOST === "localhost") {
  throw new Error("❌ Local SMTP is forbidden in production");
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
process.setMaxListeners(20);

/* ======================
   ENV DEBUG (SAFE LOGS)
====================== */
console.log("APP PORT =", process.env.PORT);


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

console.log("JWT SECRET EXISTS:", !!process.env.JWT_SECRET);


/* ======================
   STATIC FILES
====================== */
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================
   API ROUTES
====================== */
app.use("/api/wallet", require("./routes/wallet"));

/* ======================
   FRONTEND ENTRY
====================== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ======================
   START SERVER
====================== */
const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
