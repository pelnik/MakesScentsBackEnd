const { archiveProducts, makeStripeProduct } = require('.');

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

archiveProducts();

makeStripeProduct({
  product_name: 'Cool new product',
  description: 'Its so cool.',
  pic_url: '/Media/diffuser-1.jpg',
  unit_amount: '$5.99',
}).then((product) => {
  console.log('newProductId', product);
});
