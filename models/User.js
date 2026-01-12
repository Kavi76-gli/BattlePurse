const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // =========================
    // 👤 BASIC USER INFO
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // =========================
    // 📧 EMAIL OTP VERIFICATION
    // =========================
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailOtp: {
      type: String,
    },

    emailOtpExpire: {
      type: Date,
    },

    // =========================
    // 💰 WALLET & PROFILE
    // =========================
    wallet: {
      type: Number,
      default: 0,
    },

    avatar: {
  type: String,
  default: null
},


    // =========================
    // 🎮 GAME UIDs
    // =========================
    uids: {
      freeFire: String,
      bgmi: String,
      cricket: String,
      carrom: String,
      ludo: String,
      eightBall: String,
    },

    // =========================
    // 👮 ADMIN ACCESS
    // =========================
    isAdmin: {
      type: Boolean,
      default: false,
    },
    banned: {
  type: Boolean,
  default: false,
},

passkeys: [
  {
    credentialId: String,
    publicKey: String,
    counter: Number,
    deviceName: String,
    createdAt: { type: Date, default: Date.now }
  }
]
,

pinHash: { type: String },
appLockEnabled: { type: Boolean, default: false },
biometricEnabled: { type: Boolean, default: false },

    // =========================
    // 🔐 K-CODE (DEVICE UNLOCK)
    // =========================
    kCodes: [
      {
        deviceId: String,
        codeHash: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
