const client = require('./client');

async function createProduct({
  name,
  description,
  price,
  pic_url,
  size,
  inventory,
  category_id,
  color,
  fragrance,
}) {
  try {
    if (!(size === 'S' || size === 'M' || size === 'L')) {
      throw new Error('Size is not S, M, or L');
    }

    const {
      rows: [product],
    } = await client.query(
      `
        INSERT INTO products(name, description, price, pic_url, size, inventory, category_id, color, fragrance)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [
        name,
        description,
        price,
        pic_url,
        size,
        inventory,
        category_id,
        color,
        fragrance,
      ]
    );

    return product;
  } catch (error) {
    console.error('error creating product', error);
    throw error;
  }
}

module.exports = {
  createProduct,
};
