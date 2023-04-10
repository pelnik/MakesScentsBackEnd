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
    })
    
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
