const client = require('./client');
const { attachCartItems } = require('./cart_products');

// Pass in just a cart-id.
async function createNewCart({ user_id }) {
  try {
    if (!user_id) {
      throw new Error('User Id required to create new cart');
    }

    const {
      rows: [cart],
    } = await client.query(
      `
        INSERT INTO carts(user_id)
        VALUES($1)
        RETURNING *;
      `,
      [user_id]
    );

    return cart;
  } catch (error) {
    console.error('error in CreateNewCart DB function');
    throw error;
  }
}

// Remove old carts, if any
async function removeOldCarts({ user_id, status }) {
  try {
    const newCart = await createNewCart({ user_id });

    if (newCart === undefined) {
      throw new Error('Error creating new cart');
    }

    const {
      rows: [oldCart],
    } = await client.query(
      `
        UPDATE carts
        SET is_active = false, status = $2
        WHERE user_id = $1 AND is_active = true AND id != $3
        RETURNING *;
      `,
      [user_id, status, newCart.id]
    );

    return { oldCart, newCart };
  } catch (error) {
    console.error('Error removing old carts', error);
    throw error;
  }
}

async function getCartItems({ user_id, is_active }) {
  try {
    const { rows: carts } = await client.query(
      `
      SELECT *
      FROM carts
      WHERE user_id = $1 AND is_active = $2
      ;
    `,
      [user_id, is_active]
    );

    if (carts.length === 0) {
      return carts;
    }

    if (carts.length > 1 && is_active === true) {
      throw new Error('Multiple active carts returned, something is wrong');
    }

    let cartWithItems = await attachCartItems(carts);

    if (is_active === true) {
      cartWithItems = cartWithItems[0];
    }

    return cartWithItems;
  } catch (error) {
    console.error('Error getting old carts');
    throw error;
  }
}

async function updateCart({ cart_id, status }) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
        UPDATE carts
        SET status = $1
        WHERE id = $2
        RETURNING *;
      `,
      [status, cart_id]
    );

    return cart;
  } catch (error) {
    console.error('Error updating cart');
    throw error;
  }
}

module.exports = {
  createNewCart,
  getCartItems,
  updateCart,
  removeOldCarts,
};
