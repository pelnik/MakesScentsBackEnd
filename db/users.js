const client = require('./client');
const bcrypt = require('bcrypt');

const { createNewCart } = require('./carts');
console.log(typeof createNewCart, 'create new cart type');

async function createUser({ username, password, name, email, is_admin }) {
  const SALT_COUNT = 10;
  const hashed_password = await bcrypt.hash(password, SALT_COUNT);

  let admin = false;

  if (is_admin) {
    admin = true;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password, name, email, is_admin)
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
        RETURNING id, username, name, email, is_admin, is_active;
      `,
      [username, hashed_password, name, email, admin]
    );

    const cart = createNewCart({ user_id: user.id });

    user.cart = cart;

    return user;
  } catch (error) {
    console.error('error creating user');
    throw error;
  }
}

module.exports = {
  createUser,
};
