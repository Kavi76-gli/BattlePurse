const sendEmail = require("./sendEmail");

module.exports = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Your OTP Verification",
    html: `
      <div style="text-align:center;font-family:Arial,sans-serif;">
        <h2>Your OTP</h2>
        <p style="font-size:26px;font-weight:bold;color:#007bff;">
          ${otp}
        </p>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `,
  });
};
