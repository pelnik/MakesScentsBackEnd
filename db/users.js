const client = require('./client');

const bcrypt = require('bcrpyt');

async function createUser({ username, password, name, email }) {
  const SALT_COUNT = 10;
  const hashed_password = bcrypt.hash(password, SALT_COUNT);

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO 
    `,
      []
    );
  } catch ({ name, message }) {
    next({ name, message });
  }
}
