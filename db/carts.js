const client = require('./client');

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
  const { rows: carts } = await client.query(
    `
      UPDATE carts
      SET is_active = false, status = $2
      WHERE user_id = $1
      RETURNING *;
    `,
    [user_id, status]
  );

  console.log('carts', carts);
}

async function getActiveCart({ user_id }) {}

module.exports = {
  createNewCart,
};
