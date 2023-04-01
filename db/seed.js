const NUMBER_OF_FAKE_USERS = 100;
const NUMBER_OF_FAKE_PRODUCTS = 100;
const MAX_NUMBER_OF_CART_PRODUCTS = 5;

const client = require('./client');
const {
  createUser,
  createProduct,
  createCategory,
  addCartItem,
  getAllUsers,
  getCartItems,
} = require('./');

const { faker } = require('@faker-js/faker');

// Update to change all users and products
faker.seed(100);

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
      quantity INTEGER NOT NULL,
      UNIQUE(cart_id, product_id)
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

    const user_promises = [];

    for (let i = 0; i < NUMBER_OF_FAKE_USERS - 3; i += 1) {
      const fakeFirstName = faker.name.firstName();
      const fakeLastName = faker.name.lastName();

      const is_admin = faker.datatype.number(100) < 5;

      user_promises.push(
        createUser({
          name: faker.name.fullName({
            firstName: fakeFirstName,
            lastName: fakeLastName,
          }),
          username: faker.internet.userName(fakeFirstName, fakeLastName),
          password: 'fakeUser123',
          email: faker.internet.email(fakeFirstName, fakeLastName),
          is_admin,
        })
      );
    }

    const allPromises = await Promise.all(user_promises);

    console.log('user promises', allPromises[30]);

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
    await createCategory({ category_name: 'diffuser' });
    await createCategory({ category_name: 'car' });

    console.log('finished creating category');
  } catch (error) {}
}

async function createInitialProducts() {
  try {
    console.log('Creating initial products');
    await createProduct({
      name: 'Blue Jasmine and Royal Fern',
      description: 'Smells like blue jasmine and royal fern.',
      price: '$10.99',
      pic_url: faker.image.food(300, 200, true),
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
      pic_url: faker.image.food(300, 200, true),
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
      pic_url: faker.image.food(300, 200, true),
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Blue',
      fragrance: 'Blue Jasmine',
    });

    const product_promises = [];

    for (let i = 0; i < NUMBER_OF_FAKE_PRODUCTS - 3; i += 1) {
      const randomNum = faker.datatype.number(100);
      let size;

      if (randomNum < 33) {
        size = 'S';
      } else if (randomNum < 66) {
        size = 'M';
      } else {
        size = 'L';
      }

      product_promises.push(
        createProduct({
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price(9, 50, 2, '$'),
          pic_url: faker.image.food(300, 200, true),
          size,
          inventory: faker.datatype.number(5),
          category_id: faker.datatype.number({
            min: 1,
            max: 3,
          }),
          color: faker.color.human(),
          fragrance: faker.commerce.productAdjective(),
        })
      );
    }

    const allPromises = await Promise.all(product_promises);

    console.log('product promises', allPromises[30]);

    console.log('Finished create initial products');
  } catch (error) {
    console.error('error creating products', error);
    throw error;
  }
}

async function createInitialCartProducts() {
  try {
    console.log('Creating initial cart products');

    const cart_product_promises = [];
    const allUsers = await getAllUsers();

    const cart_promises = [];

    for (let i = 0; i < allUsers.length; i += 1) {
      const user = allUsers[i];
      cart_promises.push(getCartItems({ user_id: user.id, is_active: true }));
    }

    const allCarts = await Promise.all(cart_promises);

    // Will create some duplicate combos of cart and cart products
    // That's ok, the DB function will just ignore them
    for (let i = 0; i < allUsers.length; i += 1) {
      const user = allUsers[i];
      const cart = allCarts[i];

      for (let i = 0; i < MAX_NUMBER_OF_CART_PRODUCTS; i += 1) {
        cart_product_promises.push(
          await addCartItem({
            cart_id: cart.id,
            product_id: faker.datatype.number({
              min: 1,
              max: NUMBER_OF_FAKE_PRODUCTS,
            }),
            quantity: faker.datatype.number({
              min: 1,
              max: 5,
            }),
          })
        );
      }
    }

    const allPromises = await Promise.all(cart_product_promises);

    console.log('cart product promises', allPromises[30]);

    console.log('Finished creating initial cart products');
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
