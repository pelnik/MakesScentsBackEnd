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
  getAllProducts,
} = require('./');

const { archiveProducts } = require('../stripe');

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
        stripe_product_id VARCHAR(255) UNIQUE NOT NULL,
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
    await createCategory({ category_name: 'Candle' });
    await createCategory({ category_name: 'Diffuser' });
    await createCategory({ category_name: 'Car' });

    console.log('finished creating category');
  } catch (error) {}
}

async function createInitialProducts() {
  try {
    console.log('Creating initial products');

    await createProduct({
      name: 'Blue Jasmine and Royal Fern',
      description:
        'Together, blue jasmine and royal fern create a scent that is both floral and green, making it perfect for those who love the outdoors and the beauty of nature. It is a fragrance that is both elegant and refreshing, evoking a sense of tranquility and harmony.',
      price: '$10.99',
      pic_url: '/Media/Candle 1.jpg',
      size: 'S',
      inventory: 3,
      category_id: 1,
      color: 'Blue',
      fragrance: 'Blue Jasmine and Royal Fern',
    });

    await createProduct({
      name: 'Blue Jasmine and Royal Fern',
      description:
        'Together, blue jasmine and royal fern create a scent that is both floral and green, making it perfect for those who love the outdoors and the beauty of nature. It is a fragrance that is both elegant and refreshing, evoking a sense of tranquility and harmony.',
      price: '$24.99',
      pic_url: '/Media/Candle 1.jpg',
      size: 'M',
      inventory: 3,
      category_id: 1,
      color: 'Blue',
      fragrance: 'Blue Jasmine and Royal Fern',
    });

    await createProduct({
      name: 'Blue Jasmine and Royal Fern',
      description:
        'Together, blue jasmine and royal fern create a scent that is both floral and green, making it perfect for those who love the outdoors and the beauty of nature. It is a fragrance that is both elegant and refreshing, evoking a sense of tranquility and harmony.',
      price: '$40.99',
      pic_url: '/Media/Candle 1.jpg',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Blue',
      fragrance: 'Blue Jasmine and Royal Fern',
    });

    await createProduct({
      name: 'Clementine and Mint',
      description:
        'Together, clementine and mint create a scent that is bright, refreshing, and energizing. It is perfect for those who love citrus scents and want a fragrance that is both invigorating and calming.',
      price: '$10.99',
      pic_url: '/Media/Candle 2.jpg',
      size: 'S',
      inventory: 3,
      category_id: 1,
      color: 'Orange',
      fragrance: 'Clementine and Mint',
    });

    await createProduct({
      name: 'Clementine and Mint',
      description:
        'Together, clementine and mint create a scent that is bright, refreshing, and energizing. It is perfect for those who love citrus scents and want a fragrance that is both invigorating and calming.',
      price: '$24.99',
      pic_url: '/Media/Candle 2.jpg',
      size: 'M',
      inventory: 3,
      category_id: 1,
      color: 'Orange',
      fragrance: 'Clementine and Mint',
    });

    await createProduct({
      name: 'Clementine and Mint',
      description:
        'Together, clementine and mint create a scent that is bright, refreshing, and energizing. It is perfect for those who love citrus scents and want a fragrance that is both invigorating and calming.',
      price: '$40.99',
      pic_url: '/Media/Candle 2.jpg',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Orange',
      fragrance: 'Clementine and Mint',
    });

    await createProduct({
      name: 'Cashmere and Vanilla',
      description:
        'Together, cashmere and vanilla create a scent that is both indulgent and inviting. It is a fragrance that is perfect for those who love the feeling of being wrapped in a soft and cozy blanket, evoking a sense of relaxation and comfort. It is a scent that is both warm and comforting, making it perfect for use during the colder months.',
      price: '$10.99',
      pic_url: '/Media/Candle 3.jpg',
      size: 'S',
      inventory: 3,
      category_id: 1,
      color: 'White',
      fragrance: 'Cashmere and Vanilla',
    });

    await createProduct({
      name: 'Cashmere and Vanilla',
      description:
        'Together, cashmere and vanilla create a scent that is both indulgent and inviting. It is a fragrance that is perfect for those who love the feeling of being wrapped in a soft and cozy blanket, evoking a sense of relaxation and comfort. It is a scent that is both warm and comforting, making it perfect for use during the colder months.',
      price: '$24.99',
      pic_url: '/Media/Candle 3.jpg',
      size: 'M',
      inventory: 3,
      category_id: 1,
      color: 'White',
      fragrance: 'Cashmere and Vanilla',
    });

    await createProduct({
      name: 'Cashmere and Vanilla',
      description:
        'Together, cashmere and vanilla create a scent that is both indulgent and inviting. It is a fragrance that is perfect for those who love the feeling of being wrapped in a soft and cozy blanket, evoking a sense of relaxation and comfort. It is a scent that is both warm and comforting, making it perfect for use during the colder months.',
      price: '$40.99',
      pic_url: '/Media/Candle 3.jpg',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'White',
      fragrance: 'Cashmere and Vanilla',
    });

    await createProduct({
      name: 'Eucalyptus Mist',
      description:
        'Together, eucalyptus and mist create a fragrance that is both refreshing and calming. It is perfect for those who seek a fragrance that clears the mind and revitalizes the senses. It is a scent that is ideal for use in the bathroom or in a spa-like setting, creating a soothing and tranquil atmosphere.',
      price: '$10.99',
      pic_url: '/Media/Candle 4.jpg',
      size: 'S',
      inventory: 3,
      category_id: 1,
      color: 'Green',
      fragrance: 'Eucalyptus Mist',
    });

    await createProduct({
      name: 'Eucalyptus Mist',
      description:
        'Together, eucalyptus and mist create a fragrance that is both refreshing and calming. It is perfect for those who seek a fragrance that clears the mind and revitalizes the senses. It is a scent that is ideal for use in the bathroom or in a spa-like setting, creating a soothing and tranquil atmosphere.',
      price: '$24.99',
      pic_url: '/Media/Candle 4.jpg',
      size: 'M',
      inventory: 3,
      category_id: 1,
      color: 'Green',
      fragrance: 'Eucalyptus Mist',
    });

    await createProduct({
      name: 'Eucalyptus Mist',
      description:
        'Together, eucalyptus and mist create a fragrance that is both refreshing and calming. It is perfect for those who seek a fragrance that clears the mind and revitalizes the senses. It is a scent that is ideal for use in the bathroom or in a spa-like setting, creating a soothing and tranquil atmosphere.',
      price: '40.99',
      pic_url: '/Media/Candle 4.jpg',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Green',
      fragrance: 'Eucalyptus Mist',
    });

    await createProduct({
      name: 'Pine and Eucalyptus',
      description:
        'The invigorating scent of pine and eucalyptus fills the air as the candle burns, creating a rejuvenating atmosphere that promotes relaxation and revitalization.',
      price: '$9.99',
      pic_url: '/Media/candle-1.jpeg',
      size: 'S',
      inventory: 4,
      category_id: 1,
      color: 'Green',
      fragrance: 'Pine and Eucalyptus',
    });

    await createProduct({
      name: 'Pine and Eucalyptus',
      description:
        'The invigorating scent of pine and eucalyptus fills the air as the candle burns, creating a rejuvenating atmosphere that promotes relaxation and revitalization.',
      price: '$19.99',
      pic_url: '/Media/candle-1.jpeg',
      size: 'M',
      inventory: 6,
      category_id: 1,
      color: 'Green',
      fragrance: 'Pine and Eucalyptus',
    });

    await createProduct({
      name: 'Pine and Eucalyptus',
      description:
        'The invigorating scent of pine and eucalyptus fills the air as the candle burns, creating a rejuvenating atmosphere that promotes relaxation and revitalization.',
      price: '$28.99',
      pic_url: '/Media/candle-1.jpeg',
      size: 'L',
      inventory: 1,
      category_id: 1,
      color: 'Green',
      fragrance: 'Pine and Eucalyptus',
    });

    await createProduct({
      name: 'Vanilla and Amber',
      description:
        'Experience the epitome of luxury with our exquisite candle, featuring a captivating scent of warm vanilla and amber, housed in a sleek and stylish container. This premium candle is hand-poured with high-quality white wax, creating a clean and elegant aesthetic that complements any home decor. The alluring scent of vanilla and amber fills the air, creating a cozy and inviting ambiance that soothes the senses and elevates your space. Light up this candle and let the rich and comforting fragrance envelop your senses, creating a warm and welcoming atmosphere for relaxation or entertaining.',
      price: '$11.99',
      pic_url: '/Media/candle-2.jpeg',
      size: 'S',
      inventory: 1,
      category_id: 1,
      color: 'Black and white',
      fragrance: 'Vanilla and Amber',
    });

    await createProduct({
      name: 'Vanilla and Amber',
      description:
        'Experience the epitome of luxury with our exquisite candle, featuring a captivating scent of warm vanilla and amber, housed in a sleek and stylish container. This premium candle is hand-poured with high-quality white wax, creating a clean and elegant aesthetic that complements any home decor. The alluring scent of vanilla and amber fills the air, creating a cozy and inviting ambiance that soothes the senses and elevates your space. Light up this candle and let the rich and comforting fragrance envelop your senses, creating a warm and welcoming atmosphere for relaxation or entertaining.',
      price: '$22.99',
      pic_url: '/Media/candle-2.jpeg',
      size: 'M',
      inventory: 2,
      category_id: 1,
      color: 'Black and white',
      fragrance: 'Vanilla and Amber',
    });

    await createProduct({
      name: 'Vanilla and Amber',
      description:
        'Experience the epitome of luxury with our exquisite candle, featuring a captivating scent of warm vanilla and amber, housed in a sleek and stylish container. This premium candle is hand-poured with high-quality white wax, creating a clean and elegant aesthetic that complements any home decor. The alluring scent of vanilla and amber fills the air, creating a cozy and inviting ambiance that soothes the senses and elevates your space. Light up this candle and let the rich and comforting fragrance envelop your senses, creating a warm and welcoming atmosphere for relaxation or entertaining.',
      price: '$42.99',
      pic_url: '/Media/candle-2.jpeg',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Black and white',
      fragrance: 'Vanilla and Amber',
    });

    await createProduct({
      name: 'Vanilla and Coconut',
      description:
        'This exquisite candle features a warm and inviting scent of vanilla and coconut, reminiscent of a serene tropical getaway. The high-quality wax is carefully hand-poured in a harmonious blend of tan and cream hues, creating a visually appealing aesthetic that complements any home decor style. Light up this candle and let the soothing fragrance of vanilla and coconut fill the air, creating a sense of calm and relaxation. The elegant design of the container adds a touch of understated elegance to your home, making it a perfect centerpiece for your living room, bedroom, or bathroom. With its captivating scent and stylish design, this candle is a perfect choice for those who appreciate the finer things in life and seek to create a serene and inviting atmosphere in their homes.',
      price: '$8.99',
      pic_url: '/Media/candle-3.jpeg',
      size: 'S',
      inventory: 3,
      category_id: 1,
      color: 'Tan and cream',
      fragrance: 'Vanilla and Amber',
    });

    await createProduct({
      name: 'Caramel Comfort',
      description:
        'This exquisite candle features a crafted fragrance blend combines sweet caramel notes with rich vanilla and a touch of spicy cinnamon, creating a decadent aroma that will delight your senses.',
      price: '$18.99',
      pic_url: '/Media/candle_1.jpg',
      size: 'S',
      inventory: 4,
      category_id: 1,
      color: 'Brown',
      fragrance: 'Caramel and Vanilla',
    });

    await createProduct({
      name: 'Caramel Comfort',
      description:
        'This exquisite candle features a crafted fragrance blend combines sweet caramel notes with rich vanilla and a touch of spicy cinnamon, creating a decadent aroma that will delight your senses.',
      price: '$27.99',
      pic_url: '/Media/candle_1.jpg',
      size: 'M',
      inventory: 2,
      category_id: 1,
      color: 'Brown',
      fragrance: 'Caramel and Vanilla',
    });

    await createProduct({
      name: 'Caramel Comfort',
      description:
        'This exquisite candle features a crafted fragrance blend combines sweet caramel notes with rich vanilla and a touch of spicy cinnamon, creating a decadent aroma that will delight your senses.',
      price: '$41.99',
      pic_url: '/Media/candle_1.jpg',
      size: 'L',
      inventory: 0,
      category_id: 1,
      color: 'Brown',
      fragrance: 'Caramel and Vanilla',
    });

    await createProduct({
      name: 'Midnight Escape',
      description:
        'Our signature scent blend features a combination of fresh citrusy notes of bergamot and zesty lemon, balanced with floral hints of jasmine and lily of the valley. The scent is then anchored by the warmth and depth of cedarwood and patchouli, creating a unique and captivating aroma that will transport you to a serene oasis of tranquility.',
      price: '$13.99',
      pic_url: '/Media/candle_2.jpg',
      size: 'S',
      inventory: 2,
      category_id: 1,
      color: 'Black and White',
      fragrance: 'Citrus and Floral',
    });

    await createProduct({
      name: 'Midnight Escape',
      description:
        'Our signature scent blend features a combination of fresh citrusy notes of bergamot and zesty lemon, balanced with floral hints of jasmine and lily of the valley. The scent is then anchored by the warmth and depth of cedarwood and patchouli, creating a unique and captivating aroma that will transport you to a serene oasis of tranquility.',
      price: '$22.99',
      pic_url: '/Media/candle_2.jpg',
      size: 'M',
      inventory: 2,
      category_id: 1,
      color: 'Black and White',
      fragrance: 'Citrus and Floral',
    });

    await createProduct({
      name: 'Midnight Escape',
      description:
        'Our signature scent blend features a combination of fresh citrusy notes of bergamot and zesty lemon, balanced with floral hints of jasmine and lily of the valley. The scent is then anchored by the warmth and depth of cedarwood and patchouli, creating a unique and captivating aroma that will transport you to a serene oasis of tranquility.',
      price: '$32.99',
      pic_url: '/Media/candle_2.jpg',
      size: 'L',
      inventory: 5,
      category_id: 1,
      color: 'Black and White',
      fragrance: 'Citrus and Floral',
    });

    await createProduct({
      name: 'Vanilla and Coconut',
      description:
        'This exquisite candle features a warm and inviting scent of vanilla and coconut, reminiscent of a serene tropical getaway. The high-quality wax is carefully hand-poured in a harmonious blend of tan and cream hues, creating a visually appealing aesthetic that complements any home decor style. Light up this candle and let the soothing fragrance of vanilla and coconut fill the air, creating a sense of calm and relaxation. The elegant design of the container adds a touch of understated elegance to your home, making it a perfect centerpiece for your living room, bedroom, or bathroom. With its captivating scent and stylish design, this candle is a perfect choice for those who appreciate the finer things in life and seek to create a serene and inviting atmosphere in their homes.',
      price: '$17.99',
      pic_url: '/Media/candle-3.jpeg',
      size: 'M',
      inventory: 3,
      category_id: 1,
      color: 'Tan and cream',
      fragrance: 'Vanilla and Coconut',
    });

    await createProduct({
      name: 'Vanilla and Coconut',
      description:
        'This exquisite candle features a warm and inviting scent of vanilla and coconut, reminiscent of a serene tropical getaway. The high-quality wax is carefully hand-poured in a harmonious blend of tan and cream hues, creating a visually appealing aesthetic that complements any home decor style. Light up this candle and let the soothing fragrance of vanilla and coconut fill the air, creating a sense of calm and relaxation. The elegant design of the container adds a touch of understated elegance to your home, making it a perfect centerpiece for your living room, bedroom, or bathroom. With its captivating scent and stylish design, this candle is a perfect choice for those who appreciate the finer things in life and seek to create a serene and inviting atmosphere in their homes.',
      price: '$35.99',
      pic_url: '/Media/candle-3.jpeg',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Tan and cream',
      fragrance: 'Vanilla and Coconut',
    });

    await createProduct({
      name: 'Sandalwood and Vanilla',
      description:
        'Introducing our exquisite candle, housed in a charming brown container with a crisp white label, featuring premium white wax and a soothing scent of sandalwood and vanilla. This luxurious and indulgent candle is perfect for those who appreciate the rich and serene aroma of sandalwood, combined with the warmth and sweetness of vanilla. The high-quality wax is carefully hand-poured, creating a clean and elegant aesthetic that complements any home decor style. Light up this candle and let the enchanting scent of sandalwood and vanilla fill the air, creating a calming and serene ambiance that promotes relaxation and tranquility.',
      price: '$12.99',
      pic_url: '/Media/candle-4.jpeg',
      size: 'S',
      inventory: 1,
      category_id: 1,
      color: 'Brown',
      fragrance: 'Sandalwood and Vanilla',
    });

    await createProduct({
      name: 'Sandalwood and Vanilla',
      description:
        'Introducing our exquisite candle, housed in a charming brown container with a crisp white label, featuring premium white wax and a soothing scent of sandalwood and vanilla. This luxurious and indulgent candle is perfect for those who appreciate the rich and serene aroma of sandalwood, combined with the warmth and sweetness of vanilla. The high-quality wax is carefully hand-poured, creating a clean and elegant aesthetic that complements any home decor style. Light up this candle and let the enchanting scent of sandalwood and vanilla fill the air, creating a calming and serene ambiance that promotes relaxation and tranquility.',
      price: '$23.99',
      pic_url: '/Media/candle-4.jpeg',
      size: 'M',
      inventory: 1,
      category_id: 1,
      color: 'Brown',
      fragrance: 'Sandalwood and Vanilla',
    });

    await createProduct({
      name: 'Sandalwood and Vanilla',
      description:
        'Introducing our exquisite candle, housed in a charming brown container with a crisp white label, featuring premium white wax and a soothing scent of sandalwood and vanilla. This luxurious and indulgent candle is perfect for those who appreciate the rich and serene aroma of sandalwood, combined with the warmth and sweetness of vanilla. The high-quality wax is carefully hand-poured, creating a clean and elegant aesthetic that complements any home decor style. Light up this candle and let the enchanting scent of sandalwood and vanilla fill the air, creating a calming and serene ambiance that promotes relaxation and tranquility.',
      price: '$44.99',
      pic_url: '/Media/candle-4.jpeg',
      size: 'L',
      inventory: 1,
      category_id: 1,
      color: 'Brown',
      fragrance: 'Sandalwood and Vanilla',
    });

    await createProduct({
      name: 'Orange Creamsicle',
      description:
        'This delightful candle features a high-quality wax that is carefully hand-poured, creating a clean and minimalist aesthetic that complements any home decor style. The invigorating scent of orange creamsicle fills the air with notes of juicy oranges and creamy vanilla, reminiscent of a nostalgic summer treat. Light up this candle and let the refreshing aroma transport you to carefree summer days, creating a cheerful and uplifting ambiance in your space. The clear container allows for a beautiful play of light, casting a warm and inviting glow when lit. With its captivating scent and modern design, this orange creamsicle-scented candle is a perfect choice for adding a touch of zest and vibrancy to your home, and a delightful gift option for those who appreciate unique and refreshing fragrances.',
      price: '$9.99',
      pic_url: '/Media/candle-5.jpeg',
      size: 'S',
      inventory: 3,
      category_id: 1,
      color: 'Orange cream',
      fragrance: 'Orange Creamsicle',
    });

    await createProduct({
      name: 'Orange Creamsicle',
      description:
        'This delightful candle features a high-quality wax that is carefully hand-poured, creating a clean and minimalist aesthetic that complements any home decor style. The invigorating scent of orange creamsicle fills the air with notes of juicy oranges and creamy vanilla, reminiscent of a nostalgic summer treat. Light up this candle and let the refreshing aroma transport you to carefree summer days, creating a cheerful and uplifting ambiance in your space. The clear container allows for a beautiful play of light, casting a warm and inviting glow when lit. With its captivating scent and modern design, this orange creamsicle-scented candle is a perfect choice for adding a touch of zest and vibrancy to your home, and a delightful gift option for those who appreciate unique and refreshing fragrances.',
      price: '$19.99',
      pic_url: '/Media/candle-5.jpeg',
      size: 'M',
      inventory: 3,
      category_id: 1,
      color: 'Orange cream',
      fragrance: 'Orange Creamsicle',
    });

    await createProduct({
      name: 'Orange Creamsicle',
      description:
        'This delightful candle features a high-quality wax that is carefully hand-poured, creating a clean and minimalist aesthetic that complements any home decor style. The invigorating scent of orange creamsicle fills the air with notes of juicy oranges and creamy vanilla, reminiscent of a nostalgic summer treat. Light up this candle and let the refreshing aroma transport you to carefree summer days, creating a cheerful and uplifting ambiance in your space. The clear container allows for a beautiful play of light, casting a warm and inviting glow when lit. With its captivating scent and modern design, this orange creamsicle-scented candle is a perfect choice for adding a touch of zest and vibrancy to your home, and a delightful gift option for those who appreciate unique and refreshing fragrances.',
      price: '$29.99',
      pic_url: '/Media/candle-5.jpeg',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Orange cream',
      fragrance: 'Orange Creamsicle',
    });

    await createProduct({
      name: 'Fresh Linen',
      description:
        'This classic and timeless candle features a high-quality wax that is carefully hand-poured, creating a clean and minimalist aesthetic that complements any home decor style. The crisp and refreshing scent of fresh linen evokes the feeling of freshly laundered linens, with hints of cleanliness, comfort, and tranquility. Light up this candle and let the inviting aroma fill the air, creating a serene and relaxing ambiance in your space. The white container and wax add a touch of purity and simplicity to your home, blending seamlessly with any color palette or style.',
      price: '$9.99',
      pic_url: '/Media/candle-6.jpeg',
      size: 'S',
      inventory: 3,
      category_id: 1,
      color: 'White',
      fragrance: 'Fresh Linen',
    });

    await createProduct({
      name: 'Fresh Linen',
      description:
        'This classic and timeless candle features a high-quality wax that is carefully hand-poured, creating a clean and minimalist aesthetic that complements any home decor style. The crisp and refreshing scent of fresh linen evokes the feeling of freshly laundered linens, with hints of cleanliness, comfort, and tranquility. Light up this candle and let the inviting aroma fill the air, creating a serene and relaxing ambiance in your space. The white container and wax add a touch of purity and simplicity to your home, blending seamlessly with any color palette or style.',
      price: '$21.99',
      pic_url: '/Media/candle-6.jpeg',
      size: 'M',
      inventory: 3,
      category_id: 1,
      color: 'White',
      fragrance: 'Fresh Linen',
    });

    await createProduct({
      name: 'Fresh Linen',
      description:
        'This classic and timeless candle features a high-quality wax that is carefully hand-poured, creating a clean and minimalist aesthetic that complements any home decor style. The crisp and refreshing scent of fresh linen evokes the feeling of freshly laundered linens, with hints of cleanliness, comfort, and tranquility. Light up this candle and let the inviting aroma fill the air, creating a serene and relaxing ambiance in your space. The white container and wax add a touch of purity and simplicity to your home, blending seamlessly with any color palette or style.',
      price: '$32.99',
      pic_url: '/Media/candle-6.jpeg',
      size: 'L',
      inventory: 0,
      category_id: 1,
      color: 'White',
      fragrance: 'Fresh Linen',
    });

    await createProduct({
      name: 'Meadow Fresh',
      description:
        'The signature fragrance blend features a delicate balance of sweet honey and tangy lemon, accented with herbaceous notes of thyme and a hint of musk. This unique blend of scents creates a serene and uplifting ambiance, perfect for any occasion. Its uplifting scent and warm glow will transform any room into a serene haven of peace and tranquility.',
      price: '10.99',
      pic_url: '/Media/candle_3.jpg',
      size: 'S',
      inventory: 4,
      category_id: 1,
      color: 'Green',
      fragrance: 'Fresh and Herbaceous',
    });

    await createProduct({
      name: 'Meadow Fresh',
      description:
        'The signature fragrance blend features a delicate balance of sweet honey and tangy lemon, accented with herbaceous notes of thyme and a hint of musk. This unique blend of scents creates a serene and uplifting ambiance, perfect for any occasion. Its uplifting scent and warm glow will transform any room into a serene haven of peace and tranquility.',
      price: '19.99',
      pic_url: '/Media/candle_3.jpg',
      size: 'M',
      inventory: 1,
      category_id: 1,
      color: 'Green',
      fragrance: 'Fresh and Herbaceous',
    });

    await createProduct({
      name: 'Meadow Fresh',
      description:
        'The signature fragrance blend features a delicate balance of sweet honey and tangy lemon, accented with herbaceous notes of thyme and a hint of musk. This unique blend of scents creates a serene and uplifting ambiance, perfect for any occasion. Its uplifting scent and warm glow will transform any room into a serene haven of peace and tranquility.',
      price: '30.99',
      pic_url: '/Media/candle_3.jpg',
      size: 'L',
      inventory: 3,
      category_id: 1,
      color: 'Green',
      fragrance: 'Fresh and Herbaceous',
    });

    await createProduct({
      name: 'Pink Grapefruit Burst',
      description:
        "The signature fragrance blend combines juicy and tart grapefruit with sweet notes of mandarin and a hint of peach, creating a mouth-watering and energizing aroma that's perfect for any time of day. The subtle, yet sophisticated scent is perfect for creating a refreshing and uplifting atmosphere in your home.",
      price: '9.99',
      pic_url: '/Media/candle_4.jpg',
      size: 'S',
      inventory: 5,
      category_id: 1,
      color: 'Pink',
      fragrance: 'Fruity',
    });

    await createProduct({
      name: 'Pink Grapefruit Burst',
      description:
        "The signature fragrance blend combines juicy and tart grapefruit with sweet notes of mandarin and a hint of peach, creating a mouth-watering and energizing aroma that's perfect for any time of day. The subtle, yet sophisticated scent is perfect for creating a refreshing and uplifting atmosphere in your home.",
      price: '18.99',
      pic_url: '/Media/candle_4.jpg',
      size: 'M',
      inventory: 2,
      category_id: 1,
      color: 'Pink',
      fragrance: 'Fruity',
    });

    await createProduct({
      name: 'Pink Grapefruit Burst',
      description:
        "The signature fragrance blend combines juicy and tart grapefruit with sweet notes of mandarin and a hint of peach, creating a mouth-watering and energizing aroma that's perfect for any time of day. The subtle, yet sophisticated scent is perfect for creating a refreshing and uplifting atmosphere in your home.",
      price: '28.99',
      pic_url: '/Media/candle_4.jpg',
      size: 'L',
      inventory: 2,
      category_id: 1,
      color: 'Pink',
      fragrance: 'Fruity',
    });

    await createProduct({
      name: 'Lemon Grove',
      description:
        'Introducing our newest addition to our candle collection - fragrance blend features zesty and tart lemon notes, balanced with a subtle hint of bergamot and a touch of herbaceous thyme. The aroma is reminiscent of a freshly squeezed lemonade on a warm summer day, creating a warm and inviting atmosphere in any room. This candle is perfect for creating a refreshing and invigorating ambiance during your morning routine or for brightening up your living space.',
      price: '13.99',
      pic_url: '/Media/candle_5.jpg',
      size: 'S',
      inventory: 5,
      category_id: 1,
      color: 'Yellow',
      fragrance: 'Citrus',
    });

    await createProduct({
      name: 'Lemon Grove',
      description:
        'Introducing our newest addition to our candle collection - fragrance blend features zesty and tart lemon notes, balanced with a subtle hint of bergamot and a touch of herbaceous thyme. The aroma is reminiscent of a freshly squeezed lemonade on a warm summer day, creating a warm and inviting atmosphere in any room. This candle is perfect for creating a refreshing and invigorating ambiance during your morning routine or for brightening up your living space.',
      price: '21.99',
      pic_url: '/Media/candle_5.jpg',
      size: 'M',
      inventory: 5,
      category_id: 1,
      color: 'Yellow',
      fragrance: 'Citrus',
    });

    await createProduct({
      name: 'Lemon Grove',
      description:
        'Introducing our newest addition to our candle collection - fragrance blend features zesty and tart lemon notes, balanced with a subtle hint of bergamot and a touch of herbaceous thyme. The aroma is reminiscent of a freshly squeezed lemonade on a warm summer day, creating a warm and inviting atmosphere in any room. This candle is perfect for creating a refreshing and invigorating ambiance during your morning routine or for brightening up your living space.',
      price: '36.99',
      pic_url: '/Media/candle_5.jpg',
      size: 'L',
      inventory: 5,
      category_id: 1,
      color: 'Yellow',
      fragrance: 'Citrus',
    });

    await createProduct({
      name: 'Revival Midnight',
      description:
        'Our signature fragrance blend combines crisp and invigorating notes of eucalyptus and peppermint, with a hint of soothing lavender and a touch of earthy sage. The result is a refreshing and revitalizing aroma that is perfect for creating a calming and uplifting atmosphere in your home.',
      price: '14.99',
      pic_url: '/Media/candle_6.jpg',
      size: 'S',
      inventory: 5,
      category_id: 1,
      color: 'Green and Black',
      fragrance: 'Fresh and Earthy',
    });

    await createProduct({
      name: 'Revival Midnight',
      description:
        'Our signature fragrance blend combines crisp and invigorating notes of eucalyptus and peppermint, with a hint of soothing lavender and a touch of earthy sage. The result is a refreshing and revitalizing aroma that is perfect for creating a calming and uplifting atmosphere in your home.',
      price: '27.99',
      pic_url: '/Media/candle_6.jpg',
      size: 'M',
      inventory: 0,
      category_id: 1,
      color: 'Green and Black',
      fragrance: 'Fresh and Earthy',
    });

    await createProduct({
      name: 'Revival Midnight',
      description:
        'Our signature fragrance blend combines crisp and invigorating notes of eucalyptus and peppermint, with a hint of soothing lavender and a touch of earthy sage. The result is a refreshing and revitalizing aroma that is perfect for creating a calming and uplifting atmosphere in your home.',
      price: '40.99',
      pic_url: '/Media/candle_6.jpg',
      size: 'L',
      inventory: 2,
      category_id: 1,
      color: 'Green and Black',
      fragrance: 'Fresh and Earthy',
    });

    await createProduct({
      name: 'Cozy Cabin',
      description:
        'Our signature fragrance blend combines earthy and woody notes of cedarwood and sandalwood, with a hint of spicy cinnamon and a touch of sweet vanilla. Hand-poured with natural soy wax, this candle features a warm and inviting fragrance that will transport you to a cozy log cabin in the woods.',
      price: '15.99',
      pic_url: '/Media/candle_7.jpg',
      size: 'S',
      inventory: 0,
      category_id: 1,
      color: 'White',
      fragrance: 'Woody and Spice',
    });

    await createProduct({
      name: 'Cozy Cabin',
      description:
        'Our signature fragrance blend combines earthy and woody notes of cedarwood and sandalwood, with a hint of spicy cinnamon and a touch of sweet vanilla. Hand-poured with natural soy wax, this candle features a warm and inviting fragrance that will transport you to a cozy log cabin in the woods.',
      price: '25.99',
      pic_url: '/Media/candle_7.jpg',
      size: 'M',
      inventory: 4,
      category_id: 1,
      color: 'White',
      fragrance: 'Woody and Spice',
    });

    await createProduct({
      name: 'Cozy Cabin',
      description:
        'Our signature fragrance blend combines earthy and woody notes of cedarwood and sandalwood, with a hint of spicy cinnamon and a touch of sweet vanilla. Hand-poured with natural soy wax, this candle features a warm and inviting fragrance that will transport you to a cozy log cabin in the woods.',
      price: '40.99',
      pic_url: '/Media/candle_7.jpg',
      size: 'L',
      inventory: 0,
      category_id: 1,
      color: 'White',
      fragrance: 'Woody and Spice',
    });

    await createProduct({
      name: 'Birch Wood Diffuser',
      description:
        'The use of birch wood in the diffuser not only provides a natural and organic look, but it also adds an earthy scent to the aroma of the essential oils. Birch wood is known for its natural antimicrobial properties, which can help purify the air and create a healthier environment.',
      price: '$49.99',
      pic_url: '/Media/Diffuser 2.jpg',
      size: 'N',
      inventory: 8,
      category_id: 2,
      color: 'Light Brown',
      fragrance: 'Birch Wood',
    });

    await createProduct({
      name: 'Dark Wood Diffuser',
      description:
        "Using a dark wood diffuser is an excellent way to enjoy the benefits of aromatherapy, which can help promote relaxation, reduce stress, and improve overall well-being. The diffuser's sleek and stylish design can complement any room in your home or office while adding a touch of natural beauty.",
      price: '$49.99',
      pic_url: '/Media/Diffuser 1.jpg',
      size: 'N',
      inventory: 6,
      category_id: 2,
      color: 'Dark Brown',
      fragrance: 'Dark Wood',
    });

    await createProduct({
      name: 'Black Cedarwood',
      description:
        'This unique car air freshener is designed to elevate your driving experience with its luxurious fragrance and modern design. The scent of black cedarwood is sophisticated and alluring, with notes of smoky wood, warm spices, and a hint of leather, creating an ambiance of refined elegance in your car. The clear container allows for easy visibility of the fragrance level, while the black wood cap adds a touch of natural and earthy appeal. Simply hang or clip this car air freshener in your vehicle and enjoy the long-lasting scent that will make your car smell inviting and enchanting.',
      price: '$22.99',
      pic_url: '/Media/car-1.jpeg',
      size: 'N',
      inventory: 10,
      category_id: 3,
      color: 'White',
      fragrance: 'Black Cedarwood',
    });

    await createProduct({
      name: 'Vanilla, Cinnamon, and Clove Diffuser',
      description:
        'This luxurious diffuser is designed to elevate your space with its exquisite fragrance and sophisticated design. The scent of spiced vanilla is warm and comforting, with notes of sweet vanilla, cinnamon, and clove, creating a cozy and inviting aroma that fills the air with a sense of warmth and nostalgia. The glass bottle is carefully selected for its quality and beauty, and the whiskey-colored liquid adds a touch of opulence and allure to your decor. Simply insert the reeds into the bottle, and let the captivating aroma diffuse naturally, enveloping your space with a delightful scent that lingers for weeks. With its premium quality, unique fragrance, and elegant design, this spiced vanilla-scented diffuser is a perfect choice for creating a cozy and inviting atmosphere in your home or office, and a thoughtful gift option for those who appreciate the warmth and comfort of vanilla-based scents.',
      price: '$26.99',
      pic_url: '/Media/diffuser-1.jpg',
      size: 'N',
      inventory: 10,
      category_id: 2,
      color: 'Brown',
      fragrance: 'Vanilla, Cinnamon, and Clove',
    });

    await createProduct({
      name: 'Rich Oud Wood, Smoky Leather, and Warm Spice Diffuser',
      description:
        'Infused with a captivating scent that matches the allure of the bottle, this diffuser is a statement piece that enhances any room with its premium fragrance. The scent is a perfect blend of rich oud wood, smoky leather, and warm spices, creating an irresistible aroma that is both exotic and inviting. The darkened glass bottle is not only visually stunning, but also carefully chosen for its quality and durability.',
      price: '$25.99',
      pic_url: '/Media/diffuser-2.jpeg',
      size: 'N',
      inventory: 10,
      category_id: 2,
      color: 'Smoky',
      fragrance: 'Rich Oud Wood, Smoky Leather, and Warm Spices',
    });

    await createProduct({
      name: 'Mediterranean Breeze',
      description:
        'Infused with a captivating scent that matches the allure of the bottle, the fragrance blend is refreshing and invigorating scent that captures the essence of the Mediterranean coast. This fragrance combines notes of citrusy lemon and bergamot, with a hint of fresh thyme and a touch of salty sea breeze. The result is a crisp and clean aroma that will transport you to the sun-kissed shores of the Mediterranean.',
      price: '$22.99',
      pic_url: '/Media/diffuser_1.jpg',
      size: 'N',
      inventory: 8,
      category_id: 2,
      color: 'Brown',
      fragrance: 'Fresh and Herbal',
    });

    await createProduct({
      name: 'Coastal Breeze',
      description:
        'Our signature fragrance blend is a fresh and crisp scent that captures the essence of a coastal retreat. This fragrance combines notes of salty ocean breeze, with a hint of sweet jasmine and a touch of citrusy bergamot. The result is a refreshing and uplifting aroma that will transport you to a peaceful seaside escape.',
      price: '$20.99',
      pic_url: '/Media/diffuser_2.jpg',
      size: 'N',
      inventory: 9,
      category_id: 2,
      color: 'Light Brown',
      fragrance: 'Citrus Bergamot',
    });

    await createProduct({
      name: 'Fireside Cheer',
      description:
        "This signature blend is a warm and cozy fragrance that captures the essence of a crackling fire on a winter's night. This scent combines notes of rich cedarwood, smoky birch, and spicy cinnamon, with a touch of sweet vanilla and warm musk. The result is a comforting and inviting aroma that will make you feel right at home.",
      price: '$20.99',
      pic_url: '/Media/diffuser_3.jpg',
      size: 'N',
      inventory: 6,
      category_id: 2,
      color: 'Brown',
      fragrance: 'Woody and Spice',
    });

    await createProduct({
      name: 'Spring Bloom',
      description:
        'This blend is a delicate and sophisticated fragrance that captures the essence of a fresh spring garden. This scent combines notes of soft jasmine, sweet honeysuckle, and bright citrus, with a touch of musky cedarwood and earthy vetiver. The result is a floral and refreshing aroma that will uplift your mood and brighten your day. It is inspired by the beauty and freshness of a blooming flower. This diffuser is perfect for adding a touch of elegance and sophistication to your home decor, and for creating a calming and refreshing ambiance.',
      price: '$19.99',
      pic_url: '/Media/diffuser_4.jpg',
      size: 'N',
      inventory: 0,
      category_id: 2,
      color: 'White',
      fragrance: 'Floral and Fresh',
    });

    await createProduct({
      name: 'Sunburst',
      description:
        'Our signature scent is a bright and refreshing fragrance that captures the essence of a sunny summer day. This scent combines notes of juicy mandarin, zesty lemon, and sweet orange blossom, with a hint of warm vanilla and musky sandalwood. The result is a delightful and uplifting aroma that will energize your senses and brighten your mood.',
      price: '$24.99',
      pic_url: '/Media/diffuser_5.jpg',
      size: 'N',
      inventory: 10,
      category_id: 2,
      color: 'Yellow',
      fragrance: 'Citrus and Musk',
    });

    await createProduct({
      name: 'Rose Petals',
      description:
        'Our signature scent is a delicate and feminine fragrance that captures the essence of fresh roses in bloom. This scent combines notes of fragrant rose petals, sweet jasmine, and soft lily of the valley, with a hint of warm sandalwood and musk. The result is a soothing and enchanting aroma that will transport you to a blooming garden on a warm summer day.',
      price: '$23.99',
      pic_url: '/Media/diffuser_6.jpg',
      size: 'N',
      inventory: 3,
      category_id: 2,
      color: 'Pink',
      fragrance: 'Floral and Musk',
    });

    await createProduct({
      name: 'Honey Nut Car Diffuser',
      description:
        'Transform your daily commute into a sweet and indulgent experience with our "Honey Nut" car diffuser scent. This fragrance offers the perfect balance of warm honey and rich, nutty tones, creating a deliciously inviting aroma that will fill your car with warmth and comfort. The honey notes in the scent provide a natural sweetness that is perfectly complemented by the nutty undertones, creating a luxurious and indulgent aroma that will soothe and uplift your senses. Our Honey Nut car diffuser scent is perfect for those who want to transform their daily commute into a calming and luxurious experience. ',
      price: '$15.99',
      pic_url: '/Media/Car 2.jpg',
      size: 'N',
      inventory: 5,
      category_id: 3,
      color: 'Yellow',
      fragrance: 'Honey Nut',
    });

    await createProduct({
      name: 'Lost In The Louvre Car Diffuser',
      description:
        '"Lost in the Louvre" car diffuser scent is a luxurious fragrance that evokes the grandeur and elegance of the world-famous Parisian museum. This scent is inspired by the beautiful art and architecture of the Louvre, and it combines notes of bergamot, jasmine, and sandalwood to create a sophisticated and enchanting aroma. The bergamot notes provide a fresh and uplifting scent, while the jasmine adds a delicate floral touch, and the sandalwood offers a warm and woody base that evokes the timeless elegance of the Louvre. Our "Lost in the Louvre" car diffuser scent is perfect for those who want to add a touch of luxury and sophistication to their daily commute. With its elegant and enchanting aroma, this fragrance will transform your car into a luxurious oasis, creating a sense of calm and tranquility on even the most stressful of drives.',
      price: '$15.99',
      pic_url: '/Media/Car 3.jpg',
      size: 'N',
      inventory: 7,
      category_id: 3,
      color: 'Red',
      fragrance: 'Jasmine and Sandalwood',
    });

    await createProduct({
      name: 'Buddha Pear Car Diffuser',
      description:
        '"Buddha Pear" car diffuser scent is a fresh and uplifting fragrance that combines the crispness of pear with the grounding notes of sandalwood and vanilla. This scent is inspired by the peaceful and serene nature of Buddha, and it evokes a sense of calm and tranquility. The juicy sweetness of pear is perfectly balanced by the warm and grounding notes of sandalwood and vanilla, creating a well-rounded and harmonious aroma. Our "Buddha Pear" car diffuser scent is perfect for those seeking a refreshing and calming fragrance to transform their daily commute. With its serene and peaceful qualities, this scent will help you find a sense of balance and relaxation even during the busiest of drives.',
      price: '$15.99',
      pic_url: '/Media/Car 4.jpg',
      size: 'N',
      inventory: 7,
      category_id: 3,
      color: 'Pink',
      fragrance: 'Pear and Vanilla',
    });

    await createProduct({
      name: 'Next Stop: Coffee Car Diffuser',
      description:
        '"Next Stop: Coffee" car diffuser scent is a rich and invigorating fragrance that combines the bold aroma of freshly brewed coffee with the sweet and comforting notes of vanilla and caramel. This scent is perfect for coffee lovers who want to infuse their daily commute with the energizing and comforting qualities of their favorite drink. The rich coffee notes provide an invigorating and stimulating aroma, while the sweet vanilla and caramel notes add a comforting and indulgent touch. Our "Next Stop: Coffee" car diffuser scent is perfect for those who want to start their day on a high note. With its rich and energizing aroma, this fragrance will awaken your senses and help you feel ready to take on the day.',
      price: '$15.99',
      pic_url: '/Media/Car 5.jpg',
      size: 'N',
      inventory: 4,
      category_id: 3,
      color: 'Brown',
      fragrance: 'Coffee and Caramel',
    });

    await createProduct({
      name: 'Wick and Bar Combo Car Diffusers',
      description:
        'This Wick and Bar combo pack comes with 3 unique scents. "Clean Cotton" for those who enjoy the simple and refreshing aroma of freshly cleaned clothes. "Lavender" for those who seek a relaxing and tranquil aroma to transform their daily commute. "Santal + Coconut" for those who want to infuse their daily commute with a sense of warmth and indulgence. The combination of sandalwood and coconut creates a well-rounded and harmonious aroma that evokes a sense of luxury and sophistication. ',
      price: '$29.99',
      pic_url: '/Media/Car 7.jpg',
      size: 'N',
      inventory: 8,
      category_id: 3,
      color: 'Yellow',
      fragrance: 'Clean Cotton, Lavender, Santal + Coconut',
    });

    await createProduct({
      name: 'Autumn Leaves Car Diffuser',
      description:
        '"Autumn Leaves" car diffuser scent is a warm and inviting fragrance that captures the essence of autumn with its crisp and earthy aroma. This scent is perfect for those who want to infuse their daily commute with the cozy and comforting qualities of fall. The warm and spicy notes of cinnamon and clove blend perfectly with the earthy and woody notes of oak and patchouli, creating a well-rounded and harmonious fragrance that evokes the feeling of walking through a forest of fallen leaves. Our "Autumn Leaves" car diffuser scent is perfect for those who want to create a cozy and welcoming atmosphere in their car. With its warm and comforting qualities, this fragrance will help you feel relaxed and at ease on even the most hectic of drives. ',
      price: '$15.99',
      pic_url: '/Media/Car 8.jpg',
      size: 'N',
      inventory: 6,
      category_id: 3,
      color: 'Yellow',
      fragrance: 'Autumn Leaves',
    });

    await createProduct({
      name: 'Kiss of the Forest Car Diffuser',
      description:
        '"Kiss of the Forest" car diffuser scent is a fresh and invigorating fragrance that captures the essence of a walk through a forest after a light rain. This scent is perfect for those who enjoy the fresh and crisp aroma of the great outdoors. The woody and earthy notes of cedarwood and pine blend perfectly with the fresh and herbaceous notes of eucalyptus and mint, creating a well-balanced and harmonious fragrance that evokes the feeling of being surrounded by nature. Our "Kiss of the Forest" car diffuser scent is perfect for those who want to infuse their daily commute with the revitalizing and rejuvenating qualities of nature. With its fresh and invigorating qualities, this fragrance will help you feel energized and refreshed on even the most tiring of drives.',
      price: '$15.99',
      pic_url: '/Media/Car 6.jpg',
      size: 'N',
      inventory: 3,
      category_id: 3,
      color: 'Brown',
      fragrance: 'Cedarwood and Pine',
    });

    if (process.env.NODE_ENV === 'SEED_DEV') {
      const product_promises = [];

      const all_products = await getAllProducts();
      const number_of_products = all_products.length;

      for (
        let i = 0;
        i < NUMBER_OF_FAKE_PRODUCTS - number_of_products;
        i += 1
      ) {
        const randomNum = faker.datatype.number(100);
        let size;

        if (randomNum < 33) {
          size = 'S';
        } else if (randomNum < 66) {
          size = 'M';
        } else {
          size = 'L';
        }

        // Reaching Stripe rate limit so need to stagger requests
        product_promises.push(
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(
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
            }, Math.random() * 60 * 1000);
          })
        );
      }

      const allPromises = await Promise.all(product_promises);
      console.log(
        'all product promises',
        allPromises,
        'all Prmoises length',
        allPromises.length
      );

      console.log('product promises', allPromises[0]);
    }

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

    const all_products = await getAllProducts();
    const number_of_products = all_products.length;

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
              max: number_of_products,
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
    await archiveProducts();
    await createInitialProducts();
    await createInitialCartProducts();
    console.log('Finished rebuilding DB');
  } catch (error) {
    console.log('Error rebuilding DB');
    throw error;
  }
}

rebuildDB();
