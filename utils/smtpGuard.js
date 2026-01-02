// This file blocks localhost SMTP forever

const blockedHosts = ["127.0.0.1", "localhost"];

module.exports = function guardSMTP() {
  const host = process.env.EMAIL_HOST;

  if (!host) {
    throw new Error("❌ EMAIL_HOST is missing. SMTP is disabled.");
  }

  if (blockedHosts.includes(host)) {
    throw new Error("❌ Localhost SMTP is banned. Check EMAIL_HOST.");
  }
};
