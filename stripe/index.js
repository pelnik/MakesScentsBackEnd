require('dotenv').config();
const { STRIPE_KEY } = process.env;

// Need full URL for stripe integration
const BASE_URL_OF_SITE = 'makes-scents-store.netlify.app';

const stripe = require('stripe')(STRIPE_KEY);

async function archiveProducts() {
  try {
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
          stripe.prices.update(price.id, {
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
  } catch (error) {
    throw error;
  }
}

async function makeStripeProduct({
  product_name,
  description,
  pic_url,
  unit_amount,
}) {
  try {
    const floatUnit = parseFloat(unit_amount.slice(1));
    const intUnit = Math.round(floatUnit * 100);
    let fullURL;

    if (
      pic_url.includes('.com') ||
      pic_url.includes('.app') ||
      pic_url.includes('.net')
    ) {
      fullURL = pic_url;
    } else {
      fullURL = BASE_URL_OF_SITE + pic_url;
      fullURL = fullURL.replace(' ', '%20');
    }

    console.log('fullURL', fullURL);

    const product = await stripe.products.create({
      name: product_name,
      description,
      images: [fullURL],
    });

    const price = await stripe.prices.create({
      unit_amount: intUnit,
      currency: 'usd',
      product: product.id,
    });

    return { product, price };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  archiveProducts,
  makeStripeProduct,
};
