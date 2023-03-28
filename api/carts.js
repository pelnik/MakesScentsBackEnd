const express = require('express');
const cartsRouter = express.Router();

const { requireUser, requireAdminUser } = require('./utils.js');
const { getCartItems } = require('../db');

cartsRouter.get('/', requireUser, (req, res, next) => {
  console.log('entering get cart');
  console.log('req user', req.user);
  try {
    const user_id = req.user.id;

    console.log('user_id', user_id);

    const oldOrders = getCartItems({ user_id, is_active: false });

    res.send(oldOrders);
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

module.exports = cartsRouter;
