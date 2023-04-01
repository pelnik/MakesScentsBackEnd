const client = require('./client');
const bcrypt = require('bcrypt');

const { createNewCart } = require('./carts');

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

    if (user) {
      const cart = await createNewCart({ user_id: user.id });

      user.cart = cart;
    } else {
      console.log('tried to create duplicate user', username, email);
    }

    return user;
  } catch (error) {
    console.error('error creating user');
    throw error;
  }
}

async function getUser({ username, password }) {
  const user = await getUserByUsername(username);
  const hashedPassword = user.password;

  const isValid = await bcrypt.compare(password, hashedPassword);

  if (isValid) {
    delete user.password;
    return user;
  } else {
    throw new Error("Passwords don't match");
  }
}

async function getAllUsers() {
  try {
    const { rows } = await client.query(
      `SELECT id, username, name, email, is_admin, is_active 
      FROM users;
    `
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT id, username, name, email, is_admin, is_active
    FROM users
    WHERE id=$1;
    `,
      [userId]
    );

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        SELECT *
        FROM users
        WHERE username=$1;
        `,
      [username]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        SELECT *
        FROM users
        WHERE email=$1;
        `,
      [email]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        UPDATE users
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
        `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  getUser,
  getUserByUsername,
  getUserByEmail,
  updateUser,
};
