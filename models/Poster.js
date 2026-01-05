const mongoose = require("mongoose");

const posterSchema = new mongoose.Schema(
  {
    game: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    redirectUrl: {
      type: String,
      default: "/kavi.html"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poster", posterSchema);
