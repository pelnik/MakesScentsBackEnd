const express = require('express');
const cartProductsRouter = express.Router();

const { requireUser } = require('./utils');
const { getCartItems, getCartProduct } = require('../db');

cartProductsRouter.get('/', requireUser, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const is_active = true;

    const cart = await getCartItems({ user_id, is_active });

    res.send({
      success: true,
      message: "Here's you cart",
      cart: cart,
    });
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

cartProductsRouter.delete(
  '/:cart_product_id',
  requireUser,
  async (req, res, next) => {
    try {
      const user_id = req.user.id;
      let { cart_product_id } = req.params;
      cart_product_id = Number(cart_product_id);

      // Check if ID is in current user cart
      const cartProduct = await getCartProduct({ cart_product_id });

      console.log('create product', cartProduct);

      if (user_id === cartProduct.user_id) {
        const 

        res.send({
          success: true,
        });
      } else {
        next({
          name: 'WrongCartProductDelete',
          message: "Cannot delete someone else's cart item.",
        });
      }
    } catch ({ name, message }) {
      next({
        name,
        message,
      });
    }
  }
);

module.exports = cartProductsRouter;
