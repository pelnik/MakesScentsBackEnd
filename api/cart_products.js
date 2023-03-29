const express = require('express');
const cartProductsRouter = express.Router();

const { requireUser } = require('./utils');
const {
  getCartItems,
  getCartProduct,
  deleteCartItem,
  updateCartItem,
  addCartItem,
} = require('../db');

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

      if (cartProduct && cartProduct.user_id === user_id) {
        const deletedCartItem = await deleteCartItem({ cart_product_id });

        res.send({
          success: true,
          message: 'Cart item deleted.',
          cartItem: deletedCartItem,
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

cartProductsRouter.patch('/:cart_product_id', async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { quantity } = req.body;
    let { cart_product_id } = req.params;
    cart_product_id = Number(cart_product_id);

    const cartProduct = await getCartProduct({ cart_product_id });

    if (cartProduct === undefined) {
      next({
        name: 'InvalidCartProduct',
        message: 'That cart product does not exist.',
      });
    } else if (cartProduct && cartProduct.user_id === user_id) {
      const updatedItem = await updateCartItem({
        cart_product_id,
        quantity,
      });

      res.send({
        success: true,
        message: 'Quantity updated',
        item: updatedItem,
      });
    } else {
      next({
        name: 'WrongUser',
        message: "Cannot update someone else's cart item.",
      });
    }
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

cartProductsRouter.post('/:product_id', async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { quantity } = req.body;
    let { product_id } = req.params;
    product_id = Number(product_id);

    const cartProduct = await getCartItems({ user_id, is_active: true });

    const cart_id = cartProduct.id;
    console.log('cart id', cart_id);

    if (quantity === undefined) {
      next({
        name: 'QuantityRequired',
        message: 'A quantity is required to be sent in the body.',
      });
    } else {
      const addedItem = await addCartItem({
        cart_id,
        product_id,
        quantity,
      });

      if (addedItem === undefined) {
        next({
          name: 'InvalidProductId',
          message:
            'Product ID send it invalid, either duplicate or does not exist',
        });
      } else {
        res.send({
          success: true,
          message: 'Quantity updated',
          item: addedItem,
        });
      }
    }
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

module.exports = cartProductsRouter;
