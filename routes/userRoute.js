const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  isUserLoggedIn,
  logout,
  loginStatus,
  updateUser,
  changePassword,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.get("/get-user", protect, getUser);
router.get("/is-loggedin", isUserLoggedIn);
router.get("/logout", logout);
router.get("/loggedin", loginStatus);
router.patch("/update-user", protect, updateUser);
router.patch("/change-password", protect, changePassword);

logout;
loginStatus;
updateUser;
changePassword;
module.exports = router;
