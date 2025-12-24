const mongoose = require("mongoose"); // ✅ REQUIRED

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ["register", "forgot"],
    required: true
  },

  // 🔐 temp registration data
    // ✅ ADD THESE

  name: { type: String },
  phone: { type: String },
  password: { type: String },

  expiresAt: {
    type: Date,
    required: true
  },

  isAdmin: {
  type: Boolean,
  default: false
}

}, { timestamps: true });

otpSchema.index({ email: 1, otp: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


module.exports = mongoose.model("Otp", otpSchema);
