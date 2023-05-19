const express = require("express");
const router = express.Router();
const { uploads } = require("../utils/fileUploads");
const {
  createProduct,
  updateProduct,
  getProducts,
  getSingleProduct,
  deleteProduct,
  rateProduct,
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, uploads.array("images"), createProduct);
router.patch("/:id", protect, uploads.array("images"), updateProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getSingleProduct);
router.delete("/:id", protect, deleteProduct);
router.put("/rating/:id", rateProduct);

module.exports = router;
