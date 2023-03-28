const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  destroyProduct,
} = require('../db');
const productsRouter = express.Router();

// GET /api/products
productsRouter.get('/', async (req, res, next) => {
  try {
    const products = await getAllProducts();

    res.send({
      success: true,
      products,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/products **
productsRouter.post('/')

// DELETE /api/products/:product_id **

// PATCH /api/products/:product_id **
