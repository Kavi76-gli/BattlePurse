const nodemailer = require("nodemailer");

let transporter;

module.exports = async ({ to, subject, html }) => {
  if (!transporter) {
    transporter = nodemailer.createTransport(
      {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      {
        // 🔒 HARD BLOCK VERIFY / PROXY
        skipVerification: true,
      }
    );
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
