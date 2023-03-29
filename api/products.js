const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  destroyProduct,
  getProductById,
} = require("../db");
const { requireAdminUser } = require("./utils");
const productsRouter = express.Router();

// GET /api/products
productsRouter.get("/", async (req, res, next) => {
  try {
    const productsList = await getAllProducts();

    res.send({
      success: true,
      message: "These are all of current products.",
      products: productsList,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/products **
productsRouter.post("/", requireAdminUser, async (req, res, next) => {
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
    const newProduct = await createProduct({
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
      message: "You added a new product.",
      product: newProduct,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// PATCH /api/products/:product_id **
productsRouter.patch(
  "/:product_id",
  requireAdminUser,
  async (req, res, next) => {
    const { product_id } = req.params;
    const id = Number(product_id);
    const { name, description, price, pic_url, inventory } = req.body;

    try {
      const selectProduct = await getProductById(id);

      if (!selectProduct) {
        next({
          name: "ProductDoesNotExist",
          message: "Product does not exist",
        });
      } else {
        const productUpdate = await updateProduct({
          id,
          name,
          description,
          price,
          pic_url,
          inventory,
        });

        res.send({
          success: true,
          message: "You updated a product.",
          product: productUpdate,
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

// DELETE /api/products/:product_id **
productsRouter.delete(
  "/:product_id",
  requireAdminUser,
  async (req, res, next) => {
    const { product_id } = req.params;
    const id = Number(product_id);

    try {
      const selectProduct = await getProductById(id);

      if (!selectProduct) {
        next({
          name: "ProductDoesNotExist",
          message: "Product does not exist",
        });
      } else {
        await destroyProduct(id);

        res.send({
          success: true,
          message: "You deleted a product.",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

module.exports = productsRouter;
