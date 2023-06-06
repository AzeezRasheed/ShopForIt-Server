const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
  },
});

const infoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const descriptionSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const productSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  descriptions: {
    type: [descriptionSchema],
    required: true,
  },
  images: {
    type: [Object],
    required: true,
  },
  categories: {
    type: [Number],
    required: true,
  },
  additionalInfo: {
    type: [infoSchema],
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  newPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  event: {
    type: String,
    enum: ["Black Friday ", "Easter", null],
    default: null,
  },
  collections: {
    type: String,
    enum: ["Wigs", "Extensions", "Accessories", null],
    default: null,
  },
  ratings: [ratingSchema],
});

const Product = mongoose.model("Product", productSchema);
// Drop the index on ratings.user field

module.exports = Product;
