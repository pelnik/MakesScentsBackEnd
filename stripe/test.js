require('dotenv').config();
const { STRIPE_KEY } = process.env;

const stripe = require('stripe')(STRIPE_KEY);

async function archiveProducts() {
  const response = await stripe.products.list();
  const products = response.data;

  const priceResponse = await stripe.prices.list();
  const prices = priceResponse.data;

  const pricePromises = [];
  prices
    .filter((price) => {
      return price.active === true;
    })
    .forEach((price) => {
      pricePromises.push(
        stripe.price.update(price.id, {
          active: false,
        })
      );
    });

  const resolvedPricePromises = await Promise.all(pricePromises);

  const productPromises = [];
  products
    .filter((product) => {
      return product.active === true;
    })
    .forEach((product) => {
      productPromises.push(
        stripe.products.update(product.id, {
          active: false,
        })
      );
    });

  const resolvedPromises = await Promise.all(productPromises);
}

async function makeProducts() {
  const product = await stripe.products.create({
    name: 'Great product',
  });

  const price = await stripe.prices.create({
    unit_amount: 999,
    currency: 'usd',
    product: product.id,
  });
}

async function initializeProducts() {
  await archiveProducts();
  await makeProducts();
}

// makeProducts();
initializeProducts();
