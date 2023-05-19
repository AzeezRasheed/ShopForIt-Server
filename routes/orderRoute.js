const express = require("express");
const {
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrder,
  getAllOrders,
  getMonthlyIncome,
} = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

// Create Order
router.post("/", protect, createOrder);

// Update Order
router.patch("/:orderId", protect, updateOrder);

// Delete Order
router.delete("/:orderId", protect, deleteOrder);

// Get a specific Order
router.get("/:orderId", protect, getUserOrder);

// Get all Orders
router.get("/", protect, getAllOrders);

// Get Monthly Income
router.get("/monthly-income/:year/:month", protect, getMonthlyIncome);


module.exports = router;
