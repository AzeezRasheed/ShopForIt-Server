const asyncHandler = require("express-async-handler");
const Cart = require("../model/CartModel");
// const User = require("../model/userModel");

// Create Cart
const newCart = asyncHandler(async (req, res) => {
  const { items } = req.body;

  const savedCart = await Cart.create({
    user: req.user._id,
    items,
  });
  if (savedCart) {
    res.status(201);
    res.json(savedCart);
  } else {
    res.status(400);
    throw new Error("Failed to add to cart");
  }
});

//update cart
const updateCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;

  try {
    const cart = await Cart.findById(id);

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    cart.items = items;
    const updatedCart = await cart.save();

    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json("Please check the id of the cart");
  }
});

//DELETE
const deleteCart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cart = await Cart.findById(id);

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  try {
    await Cart.findByIdAndDelete(id);
    res.status(200).json("Cart has been deleted...");
  } catch (err) {
    res.status(500).json("Unable to delete Cart, please try again");
  }
});

const getAllCarts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const carts = await Cart.find({ user: userId });
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json("Error retrieving carts");
  }
});

const getCart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const cart = await Cart.findOne({ _id: id, user: req.user.id });

    if (!cart) {
      res.status(404);
      throw new Error("Cart not found");
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json("Error retrieving cart");
  }
});

module.exports = { newCart, updateCart, deleteCart, getAllCarts, getCart };
