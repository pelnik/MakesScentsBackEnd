const { archiveProducts, makeStripeProduct } = require('.');
const { createProduct } = require('../db');

require('dotenv').config();
const { STRIPE_KEY } = process.env;

// Need full URL for stripe integration
const BASE_URL_OF_SITE = 'makes-scents.netlify.app';

const stripe = require('stripe')(STRIPE_KEY);

async function listProducts() {
  const response = await stripe.products.list();
  console.log('response', response);
  console.log('response images', response.data[0].images);
}

listProducts();

// archiveProducts();

makeStripeProduct({
  product_name: 'Cool new product',
  description: 'Its so cool.',
  pic_url: '/Media/diffuser-1.jpg',
  unit_amount: '$5.99',
}).then(({ product }) => {
  console.log('product response', product);
});

createProduct({
  name: 'Blue Jasmine and Royal Fern2 2',
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
