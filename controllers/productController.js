const asyncHandler = require("express-async-handler");
const Product = require("../model/productModel");
const cloudinary = require("cloudinary").v2;
const { fileSizeFormatter } = require("../utils/fileUploads");
const User = require("../model/userModel");

//create a new product
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    descriptions,
    categories,
    oldPrice,
    newPrice,
    event,
    additionalInfo,
    collections,
  } = req.body;

  if (!title || !descriptions || !categories || !newPrice || !collections) {
    res.status(400);
    throw new Error("Please fill in all the required fields");
  }

  let fileData;

  if (req.files) {
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Shop For It",
        resource_type: "images",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Could not upload file");
    }

    fileData = req.files.map((file) => ({
      fileName: file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    }));
  }

  const product = await Product.create({
    user: req.user._id,
    title,
    descriptions,
    categories,
    oldPrice,
    newPrice,
    event,
    collections,
    additionalInfo,
    image: fileData,
  });

  if (product) {
    res.status(201);
    res.json(product);
  } else {
    res.status(400);
    throw new Error("Failed to create product");
  }
});

//update product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    descriptions,
    categories,
    additionalInfo,
    oldPrice,
    newPrice,
    event,
    collections,
  } = req.body;

  const product = await Product.findById(id);

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  if (product) {
    let fileData = [];

    if (req.files) {
      let uploadedFiles;
      try {
        uploadedFiles = await Promise.all(
          req.files.map((file) =>
            cloudinary.uploader.upload(file.path, {
              folder: "Shop For It",
              resource_type: "image",
            })
          )
        );
      } catch (error) {
        res.status(500);
        throw new Error("Could not upload file");
      }

      fileData = req.files.map((file, index) => ({
        fileName: file.originalname,
        filePath: uploadedFiles[index].secure_url,
        fileType: file.mimetype,
        fileSize: fileSizeFormatter(file.size, 2),
      }));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      {
        title,
        descriptions,
        categories,
        oldPrice,
        newPrice,
        event,
        additionalInfo,
        collections,
        images: Object.keys(fileData).length === 0 ? product?.images : fileData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedProduct);
  }
});

//get products
const getProducts = asyncHandler(async (req, res) => {
  const product = await Product.find({ user: req.user._id });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200);
  res.json(product);
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  await Product.findOneAndDelete({ _id: id });
  res.status(200).json("Successful Deleted Product");
});

//user rate the product, but it will be one time rating,
// user cannot rate more than once
const rateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, rating, review } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const user = await User.findOne({ _id: userId }); // Use findOne instead of findById
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if the user has already rated the product
    const existingRating = product.ratings.find(
      (r) => r.user.toString() === userId
    );

    if (existingRating) {
      res.status(400).send("You have already rated this product");
      return; // Return early to prevent further execution
    }

    // Create a new rating
    product.ratings.push({ user: userId, rating, review });
    await product.save();
    res.status(201).send("Product rated");
  } catch (error) {
    res.status(500).send("Unable to rate the product, please try again later");
  }
});

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getSingleProduct,
  deleteProduct,
  rateProduct,
};
