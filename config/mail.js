const axios = require("axios");

async function sendEmail({ to, subject, html }) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("❌ BREVO_API_KEY missing in environment");
  }

  return axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "BattlePurse",
        email: "no-reply@battlepurse.online"
      },
      to: [{ email: to }],
      subject,
      htmlContent: html
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );
}

module.exports = sendEmail;
