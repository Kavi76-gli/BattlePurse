const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const authHeader = req.header("Authorization");

  // ❌ No token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      msg: "No token, authorization denied"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Load user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "User not found"
      });
    }

    // 🚫 BLOCK BANNED USER
    if (user.banned) {
      return res.status(403).json({
        success: false,
        msg: "Your account has been banned. Contact support."
      });
    }

    // ✅ Attach full user
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({
      success: false,
      msg: "Token is not valid"
    });
  }
};
