const mongoose = require("mongoose");

/* =========================
   SLOT SCHEMA
========================= */
const SlotSchema = new mongoose.Schema(
  {
    uid: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    phone: { type: String, default: null },
    whatsappNumber: { type: String, default: null },
    joinedAt: { type: Date, default: Date.now },

    result: {
      type: String,
      enum: ["win", "loss", "pending"],
      default: "pending"
    },
    winningPrice: { type: Number, default: 0 }
  },
  { _id: false }
);

/* =========================
   PLAYER SCHEMA
========================= */
const PlayerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: null },
    uid: { type: String, default: null },
    phone: { type: String, default: null },
    whatsappNumber: { type: String, default: null },

    team: {
      type: String,
      enum: ["LION", "TIGER"],
      default: null
    },

    rounds: {
  type: Number,
  enum: [7, 9, 11, 13, 15, null],
  default: null
},


 
    joinedAt: { type: Date, default: Date.now },

    /* ⭐ FREE FIRE SETTINGS (ROUTES SAFE) ⭐ */
    freeFireSettings: {
      map: { type: String, default: null },
      roomType: { type: String, default: "regular" },

      gameSettings: {
        headshot: { type: Boolean, default: false },
        characterSkill: { type: Boolean, default: false },
        gunAttributes: { type: Boolean, default: false },
        throwableLimit: { type: Boolean, default: false },
      },

      selectedGuns: {
        AR: { type: [String], default: [] },
        SMG: { type: [String], default: [] },
        SNIPER: { type: [String], default: [] },
        SHOTGUN: { type: [String], default: [] },
        PISTOLS: { type: [String], default: [] },
        LAUNCHERS: { type: [String], default: [] },
        SPECIAL: { type: [String], default: [] }
      }
    }
  },
  { _id: false }
);

/* =========================
   MAIN QUICK MATCH SCHEMA
========================= */
const QuickMatchSchema = new mongoose.Schema(
  {

    matchNumber: {
  type: Number,
  unique: true,
  required: true
},

    

    prizeSystem: {
      type: String,
      enum: ["kill_based", "team_equal", null],
      default: null
    },

    /* Match Type */
    type: {
      type: String,
      enum: [
        "1v1", "1v2", "1v3",
        "2v2", "3v3", "4v4",
        "5v5", "6v6",
        "TDM", "Gun Game",
        "classic", "freestyle",
        "Custom Room", "quick", "popular",
        "Clash Squad", "Lone Wolf",
        "1 over"
      ],
      required: true
    },

    /* Game */
    game: {
      type: String,
      enum: [
        "BGMI",
        "PUBG",
        "Free Fire",
        "Ludo",
        "Carrom",
        "8 Ball Pool",
        "Cricket",
        "Chess"
      ],
      required: true
    },

    /* Mode */
    mode: {
      type: String,
      required: true
    },

     entryFee: {
      type: Number,
      required: true
    },
   


    slots: {
      type: [SlotSchema],
      default: []
    },

    players: {
      type: [PlayerSchema],
      default: []
    },

    roomDetails: {
      roomId: { type: String, default: null },
      roomPassword: { type: String, default: null },
      startTime: { type: Date, default: null },
      message: { type: String, default: null },
      publishedAt: { type: Date, default: null }
    },

    /* Results uploaded by players */
    userResults: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        gameUid: String,
        screenshotUrl: String,
        kills: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
        team: { type: String, enum: ["LION", "TIGER"], default: null }
      }
    ],

    status: {
      type: String,
      enum: [
        "waiting",
        "ready",
        "paired",
        "filled",
        "completed",
        "room_published",
        "full"
      ],
      default: "waiting"
    }
  },
  { timestamps: true }
);

/* =========================
   AUTO MATCH NUMBER + SLOTS
========================= */
QuickMatchSchema.pre("validate", function (next) {
  if (!this.matchNumber) {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.matchNumber = `QM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${rand}`;
  }

  const typeToPlayers = {
    "1v1": 2,
    "1v2": 3,
    "1v3": 4,
    "2v2": 4,
    "3v3": 6,
    "4v4": 8,
    "5v5": 10,
    "6v6": 12
  };

  if (!this.slots || this.slots.length === 0) {
    const totalSlots = typeToPlayers[this.type] || 2;
    this.slots = Array.from({ length: totalSlots }, () => ({}));
  }

  next();
});

/* =========================
   VIRTUALS
========================= */
QuickMatchSchema.virtual("joinedCount").get(function () {
  if (!Array.isArray(this.slots)) return 0;
  return this.slots.filter(s => s?.userId || s?.uid).length;
});

QuickMatchSchema.set("toJSON", { virtuals: true });
QuickMatchSchema.set("toObject", { virtuals: true });

/* =========================
   INDEXES (VERY IMPORTANT)
========================= */
QuickMatchSchema.index({ createdAt: -1 });
QuickMatchSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("QuickMatch", QuickMatchSchema);
