const client = require('./client');

async function getAllCartItems({ cart_id }) {
  try {
    if (!cart_id) {
      throw new Error('Cart ID needed to get cart items.');
    }

    const { rows: products } = await client.query(
      `
      SELECT 
        cp.*,
        p.name As product_name,
        p.description As product_description,
        p.price As product_price,
        p.pic_url As product_pic_url,
        p.size As product_size,
        p.inventory As product_inventory,
        p.color As product_color,
        p.fragrance As product_fragrance,
        c.category_name
      FROM cart_products cp
      LEFT JOIN products p
        ON cp.product_id = p.id
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE cp.cart_id = $1
    `,
      [cart_id]
    );

    console.log('cart products', products);

    return products;
  } catch (error) {
    console.error('error getting all cart items in DB');
    throw error;
  }
}

async function addCartItem({ cart_id, product_id, quantity }) {
  try {
    const {
      rows: [cart_product],
    } = await client.query(
      `
        INSERT INTO cart_products(cart_id, product_id, quantity)
        VALUES($1, $2, $3)
        RETURNING *;
      `,
      [cart_id, product_id, quantity]
    );

    console.log('cart_product', cart_product);

    return cart_product;
  } catch (error) {
    console.error('error in addCartItem DB function');
    throw error;
  }
}

getAllCartItems({ cart_id: 1 });

module.exports = {
  getAllCartItems,
  addCartItem,
};
