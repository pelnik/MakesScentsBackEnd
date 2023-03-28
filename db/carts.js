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

module.exports = {
  createNewCart,
};
