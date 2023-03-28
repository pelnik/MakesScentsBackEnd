const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  destroyProduct,
  getProductById,
} = require("../db");
const productsRouter = express.Router();

// GET /api/products
productsRouter.get("/", async (req, res, next) => {
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
productsRouter.post("/", requireAdmin, async (req, res, next) => {
  const {
    name,
    description,
    price,
    pic_url,
    size,
    inventory,
    category_id,
    color,
    fragrance,
  } = req.body;

  try {
    const product = await createProduct({
      name,
      description,
      price,
      pic_url,
      size,
      inventory,
      category_id,
      color,
      fragrance,
    });

    res.send({
      success: true,
      product,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// PATCH /api/products/:product_id **

// DELETE /api/products/:product_id **