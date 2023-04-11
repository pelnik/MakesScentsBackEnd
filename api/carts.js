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

async function createCartArray(userId) {
  try {
    const cartResponse = await getCartItems({
      user_id: userId,
      is_active: true,
    });
    console.log('cart Response', cartResponse);

    const cartItems = cartResponse.items;

    const mappedItems = cartItems
      .filter((item) => {
        return item.quantity > 0;
      })
      .map((item) => {
        return {
          price: item.stripe_price_id,
          quantity: item.quantity,
        };
      });

    console.log('mappedItems', mappedItems);

    return mappedItems;
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
}

cartsRouter.post(
  '/create-checkout-session',
  requireUser,
  async (req, res, next) => {
    try {
      const stripeItems = await createCartArray(req.user.id);

      console.log('stripe-items', stripeItems);

      if (stripeItems.length > 0) {
        const session = await stripe.checkout.sessions.create({
          line_items: stripeItems,
          mode: 'payment',
          success_url: `https://${WEBSITE_DOMAIN}/checkout-success`,
          cancel_url: `https://${WEBSITE_DOMAIN}/checkout-cancel`,
          automatic_tax: { enabled: true },
        });

        console.log('session', session);

        res.redirect(303, session.url);
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
  }
);

// Close old cart and get new one
cartsRouter.post('/:cart_id', requireUser, async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { status } = req.body;
    let { cart_id } = req.params;
    cart_id = Number(cart_id);

    const ALLOWED_STATUSES = ['Cancelled', 'Completed'];

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
