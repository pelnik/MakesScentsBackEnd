const client = require('./client');
const {
  createUser,
  createProduct,
  createCategory,
  addCartItem,
} = require('./');

async function dropTables() {
  try {
    console.log('DROPPING ALL TABLES');

    await client.query(`
      DROP TABLE IF EXISTS cart_products;
      DROP TABLE IF EXISTS carts;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS users;
    `);

    console.log('FINISHED DROPPING ALL TABLES');
  } catch (error) {
    console.error('ERROR dropping tables');
    throw error;
  }
}

async function createTables() {
  try {
    console.log('CREATING ALL TABLES');
    await client.query(`
      CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true
      );
    `);

    await client.query(`
    CREATE TABLE categories(
      id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) UNIQUE NOT NULL
    );
  `);

    await client.query(`
    CREATE TABLE carts(
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      is_active BOOLEAN NOT NULL DEFAULT true,
      status VARCHAR(255) NOT NULL DEFAULT 'Created'
    );
  `);

    await client.query(`
      CREATE TABLE products(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price MONEY NOT NULL,
        pic_url VARCHAR(255) NOT NULL,
        size VARCHAR(1) NOT NULL,
        inventory INTEGER NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        color VARCHAR(255) NOT NULL,
        fragrance VARCHAR(255) NOT NULL,
        UNIQUE(name, size)
      );
    `);

    await client.query(`
    CREATE TABLE cart_products(
      id SERIAL PRIMARY KEY,
      cart_id INTEGER REFERENCES carts(id),
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL
    );
  `);

    console.log('FINISHED CREATING ALL TABLES');
  } catch (error) {
    console.error('ERROR creating tables');
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log('Creating Users');
    await createUser({
      username: 'sandra',
      password: 'sandra123',
      name: 'sandra',
      email: 'sandra@email.com',
      is_admin: 'true',
    });

    await createUser({
      username: 'albert',
      password: 'bertie99',
      name: 'Albert',
      email: 'albert@email.com',
      is_admin: 'true',
    });

    await createUser({
      username: 'glamgal',
      password: 'iloveglam',
      name: 'Joshua',
      email: 'joshua@email.com',
    });

    console.log('Finished creating users');
  } catch (error) {
    console.error('ERROR creating initial users');
    throw error;
  }
}

async function createInitialCategories() {
  try {
    console.log('creating category');
    await createCategory({ category_name: 'candle' });

    console.log('finished creating category');
  } catch (error) {}
}

async function createInitialProducts() {
  try {
    console.log('Finished create initial products');
    await createProduct({
      name: 'Blue Jasmine and Royal Fern',
      description: 'Smells like blue jasmine and royal fern.',
      price: '$10.99',
      pic_url: 'https://picsum.photos/200/300',
      size: 'S',
      inventory: 3,
      category_id: 1,
      color: 'Blue',
      fragrance: 'Blue Jasmine',
    });

    await createProduct({
      name: 'Blue Jasmine and Royal Fern',
      description: 'Smells like blue jasmine and royal fern.',
      price: '$24.99',
      pic_url: 'https://picsum.photos/200/300',
      size: 'M',
      inventory: 3,
      category_id: 1,
      color: 'Blue',
      fragrance: 'Blue Jasmine',
    });

    await createProduct({
      name: 'Blue Jasmine and Royal Fern',
      description: 'Smells like blue jasmine and royal fern.',
      price: '$40.99',
      pic_url: 'https://picsum.photos/200/300',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Blue',
      fragrance: 'Blue Jasmine',
    });

    console.log('Finished create initial products');
  } catch (error) {
    console.error('error creating products', error);
    throw error;
  }
}

async function createInitialCartProducts() {
  try {
    await addCartItem({
      cart_id: 1,
      product_id: 1,
      quantity: 2,
    });

    await addCartItem({
      cart_id: 2,
      product_id: 2,
      quantity: 3,
    });
  } catch (error) {
    console.error('Error creating initial cart product');
    throw error;
  }
}

async function rebuildDB() {
  try {
    console.log('rebuilding DB');
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialCategories();
    await createInitialProducts();
    await createInitialCartProducts();
    console.log('Finished rebuilding DB');
  } catch (error) {
    console.log('Error rebuilding DB');
    throw error;
  }
}

rebuildDB();
