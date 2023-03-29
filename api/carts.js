const express = require('express');
const cartsRouter = express.Router();

const { requireUser, requireAdminUser } = require('./utils.js');
const { getCartItems, updateCart, removeOldCarts } = require('../db');

// Get previous orders
cartsRouter.get('/', requireUser, async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const oldOrders = await getCartItems({ user_id, is_active: false });

    res.send({
      success: true,
      message: 'Here are you orders.',
      orders: oldOrders,
    });
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

// Update status on order
cartsRouter.patch('/:cart_id', requireAdminUser, async (req, res, next) => {
  try {
    const ALLOWED_STATUSES = [
      'Created',
      'Processing',
      'Cancelled',
      'Completed',
    ];

    const { cart_id } = req.params;
    const id = Number(cart_id);

    const { status } = req.body;

    if (ALLOWED_STATUSES.includes(status)) {
      const updatedCart = await updateCart({
        cart_id: id,
        status: status,
      });

      res.send({
        success: true,
        message: 'Status updated',
        cart: updatedCart,
      });
    } else {
      next({
        name: 'StatusNotAllowed',
        message: 'Not one of the allowed statuses',
      });
    }
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

// Close old cart and get new one
cartsRouter.post('/', requireUser, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { status } = req.body;

    const ALLOWED_STATUSES = ['Cancelled', 'Completed'];

    if (ALLOWED_STATUSES.includes(status)) {
      const { oldCart, newCart } = await removeOldCarts({ user_id, status });

      res.send({
        success: true,
        message: 'Old cart archived. New cart created',
        oldCart,
        newCart,
      });
    } else {
      next({
        name: 'StatusNotAllowed',
        message: 'Not one of the allowed statuses',
      });
    }
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

module.exports = cartsRouter;
