const express = require('express');
const cartsRouter = express.Router();

const { requireUser, requireAdminUser } = require('./utils.js');
const { getCartItems, updateCart } = require('../db');

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

module.exports = cartsRouter;
