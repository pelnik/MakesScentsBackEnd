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
async function removeOldCarts({ cart_id, status }) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
        UPDATE carts
        SET is_active = false, status = $2
        WHERE cart_id = $1
        RETURNING *;
      `,
      [cart_id, status]
    );

    return cart;
  } catch (error) {
    console.error('Error removing old carts');
    throw error;
  }
}

async function getActiveCart({ user_id }) {
  try {
    const { rows: carts } = await client.query(
      `
      SELECT *
      FROM carts
      WHERE user_id = $1 AND is_active = true
      ;
    `,
      [user_id]
    );

    if (carts && carts.length === 0) {
      throw new Error('No carts for user, wrong user id?');
    } else if (carts && carts.length > 1) {
      throw new Error("Multiple active carts. This shouldn't happen.");
    } else {
      return carts;
    }
  } catch (error) {
    console.error('Error in getActiveCart DB function');
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

    const cartWithItems = await attachCartItems(carts);

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
};
