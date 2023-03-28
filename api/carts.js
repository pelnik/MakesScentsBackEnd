const express = require('express');
const cartsRouter = express.Router();

const { requireUser, requireAdminUser } = require('./utils.js');
const { getCartItems } = require('../db');

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

module.exports = cartsRouter;
