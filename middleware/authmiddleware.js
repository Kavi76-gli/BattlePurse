const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user; // full user document
    next();
  } catch (err) {
    console.error("auth error:", err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
