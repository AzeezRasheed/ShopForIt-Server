const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  newCart,
  updateCart,
  deleteCart,
  getAllCarts,
  getCart,
} = require("../controllers/cartController");

router.post("/", protect, newCart);
router.patch("/:id", protect, updateCart);
router.delete("/:id", protect, deleteCart);
router.get("/", protect, getAllCarts);
router.get("/:id", protect, getCart);

module.exports = router;
