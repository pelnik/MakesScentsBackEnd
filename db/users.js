const client = require('./client');

const bcrypt = require('bcrypt');

async function createUser({ username, password, name, email, isAdmin }) {
  const SALT_COUNT = 10;
  const hashed_password = bcrypt.hash(password, SALT_COUNT);

  let admin = false;

  if (isAdmin) {
    admin = true;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password, name, email, isAdmin)
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
        RETURNING id, username, name, email, isAdmin, isActive;
      `,
      [username, hashed_password, name, email, admin]
    );

    return user;
  } catch (error) {
    console.error('error creating user');
    throw error;
  }
}

module.exports = {
  createUser,
};
