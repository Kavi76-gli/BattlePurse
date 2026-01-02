require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
process.setMaxListeners(20);

/* ======================
   DEBUG ENV (VERY IMPORTANT)
====================== */
console.log("SMTP HOST =", process.env.EMAIL_HOST);
console.log("SMTP PORT =", process.env.EMAIL_PORT);
console.log("SMTP USER =", process.env.EMAIL_USER);
console.log("SMTP PASS LENGTH =", process.env.EMAIL_PASS?.length);
console.log("APP PORT =", process.env.PORT);

/* ======================
   FAIL FAST IF SMTP ENV MISSING
====================== */
if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT) {
  console.error("❌ SMTP ENV VARIABLES MISSING");
  process.exit(1);
}

/* ======================
   SMTP VERIFY (ONE TIME)
====================== */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP VERIFY FAILED:", err.message);
  } else {
    console.log("✅ SMTP VERIFIED & READY");
  }
});

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/ping", (req, res) => {
  res.json({ ok: true, msg: "Server is responding" });
});

/* ======================
   STATIC FILES
====================== */
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================
   MONGODB CONNECTION
====================== */
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ======================
   ROUTES
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
  res.status(404).json({ msg: "Route not found" });
});

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
