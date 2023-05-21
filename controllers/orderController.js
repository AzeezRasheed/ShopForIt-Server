const asyncHandler = require("express-async-handler");
const Cart = require("../model/CartModel");
const Order = require("../model/OrderModel");
const moment = require("moment");
// const User = require("../model/userModel");

const createOrder = asyncHandler(async (req, res) => {
  const { cartId, paymentMethod, totalPrice, billingDetails } = req.body;

  try {
    const cart = await Cart.findById({ _id: cartId }).populate("items.product");
    // Check if the cart is empty or if the product field is null for any item
    if (!cart || cart.items.some((item) => item.product === null)) {
      res.status(404);
      throw new Error("Cart not found or invalid product");
    }

    // Create the order using the cart and other details
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      paymentMethod,
      billingDetails,
      totalPrice,
      // Other order details
    });

    // // Clear the cart
    // cart.items = [];
    // await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
});

// Update Order
const updateOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { paymentMethod, billingDetails, totalPrice } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.billingDetails = billingDetails || order.billingDetails;
    order.totalPrice = totalPrice || order.totalPrice;

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json("Error updating order");
  }
});

// Delete Order
const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    await order.remove();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json("Error deleting order");
  }
});

// Get User Order
const getUserOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate(
      "user",
      "firstname lastname email"
    );

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json("Error fetching user order");
  }
});

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find().populate(
      "user",
      "firstname lastname email"
    );

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json("Error fetching orders");
  }
});

// Get Monthly Income
const getMonthlyIncome = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  try {
    const startDate = moment(`${year}-${month}-01`).startOf("month");
    const endDate = moment(startDate).endOf("month");

    const income = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalIncome = income.length > 0 ? income[0].totalIncome : 0;
    res.status(200).json({ year, month, totalIncome });
  } catch (error) {
    res.status(500).json("Error calculating monthly income");
  }
});

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrder,
  getAllOrders,
  getMonthlyIncome,
};
