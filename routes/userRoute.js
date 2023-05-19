const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  isUserLoggedIn,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.get("/get-user", protect, getUser);
router.get("/is-loggedin", isUserLoggedIn);

module.exports = router;
