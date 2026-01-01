const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Optional: verify connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP connection failed:", err.message);
  } else {
    console.log("SMTP server ready");
  }
});

module.exports = transporter;
