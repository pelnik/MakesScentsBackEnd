const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  destroyProduct,
} = require("../db");
const productsRouter = express.Router();