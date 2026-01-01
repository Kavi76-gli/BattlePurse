const nodemailer = require("nodemailer");

// ✅ Create transporter ONCE
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // must be false for port 587
  auth: {
    user: process.env.EMAIL_USER || "apikey",
    pass: process.env.EMAIL_PASS, // Brevo SMTP KEY
  },
});

// ✅ Verify SMTP at startup (VERY IMPORTANT)
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP VERIFY FAILED:", err.message);
  } else {
    console.log("✅ SMTP VERIFIED & READY");
  }
});

// ✅ Export sendEmail function
module.exports = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM, // must be authenticated domain
    to,
    subject,
    html,
  });
};
