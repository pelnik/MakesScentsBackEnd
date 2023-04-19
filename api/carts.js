const express = require('express');
const cartsRouter = express.Router();

const { STRIPE_KEY } = process.env;
const stripe = require('stripe')(STRIPE_KEY);
const WEBSITE_DOMAIN = 'https://makes-scents.netlify.app';

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

cartsRouter.get('/stripe-secret', requireUser, async (req, res, next) => {
  try {
    const cartItemResponse = await getCartItems({
      user_id: req.user.id,
      is_active: true,
    });

    const cartItems = cartItemResponse.items;

    if (cartItems.length > 0) {
      const total = cartItems.reduce((acc, item) => {
        const cleanPrice = item.product_price.slice(1);
        const numY = parseFloat(cleanPrice);

        itemSubtotal = numY * item.quantity * 100;

        return acc + itemSubtotal;
      }, 0);
      const roundedTotal = Math.round(total);

      const intent = await stripe.paymentIntents.create({
        amount: roundedTotal,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });

      res.send({
        success: true,
        message: "Here's you payment info",
        client_secret: intent.client_secret,
      });
    } else {
      next({
        name: 'NoItemsInCart',
        message: 'No items to checkout in cart.',
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
cartsRouter.post('/:cart_id', requireUser, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { status } = req.body;
    let { cart_id } = req.params;
    cart_id = Number(cart_id);

    const ALLOWED_STATUSES = ['Cancelled', 'Completed', 'Processing'];

    const currentCart = await getCartItems({ user_id, is_active: true });

    if (currentCart.id !== cart_id) {
      next({
        name: 'WrongCartError',
        message: 'Cart ID sent is incorrect',
      });
    } else if (ALLOWED_STATUSES.includes(status)) {
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
