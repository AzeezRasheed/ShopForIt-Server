const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401);
    throw new Error("Invalid token");
  }

  const token = authHeader.split(" ")[1];

  const verified = jwt.verify(token, process.env.JWT_SECRET);

  if (!verified) {
    res.status(401);
    throw new Error("Invalid token");
  }
  const user = await User.findById(verified.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  req.user = user;
  next();
});

module.exports = protect;
