const nodemailer = require("nodemailer");

console.log("SMTP HOST =", process.env.EMAIL_HOST);
console.log("SMTP PORT =", process.env.EMAIL_PORT);
console.log("SMTP USER =", process.env.EMAIL_USER);
console.log("SMTP PASS LENGTH =", process.env.EMAIL_PASS?.length);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER, // apikey
    pass: process.env.EMAIL_PASS, // xsmtpsib-xxxx
  },
});

/* ======================
   VERIFY SMTP (ON START)
====================== */
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP VERIFY FAILED:", err.message);
  } else {
    console.log("✅ SMTP VERIFIED & READY");
  }
});

module.exports = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
