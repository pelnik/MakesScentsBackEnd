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
        p.stripe_product_id As stripe_product_id,
        p.stripe_price_id As stripe_price_id,
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
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [cart_id, product_id, quantity]
    );

    return cart_product;
  } catch (error) {
    console.error('error in addCartItem DB function');
    throw error;
  }
}

// Pass in array of carts
async function attachCartItems(carts) {
  try {
    if (!Array.isArray(carts)) {
      throw new Error('Carts parameter should be array.');
    }

    if (carts.length === 0) {
      return carts;
    }

    orderItemPromises = carts.map((cart) => {
      return getAllCartItems({ cart_id: cart.id });
    });

    const orderItems = await Promise.all(orderItemPromises);

    const returnCarts = carts.map((cart, idx) => {
      cart.items = orderItems[idx];
      return cart;
    });

    return returnCarts;
  } catch (error) {
    console.error('Error getting old carts');
    throw error;
  }
}

async function deleteCartItem({ cart_product_id }) {
  try {
    const {
      rows: [cart_product],
    } = await client.query(
      `
        DELETE FROM cart_products
        WHERE id = $1
        RETURNING *
        ;
      `,
      [cart_product_id]
    );

    return cart_product;
  } catch (error) {
    console.error('error in addCartItem DB function');
    throw error;
  }
}

async function updateCartItem({ cart_product_id, quantity }) {
  try {
    const {
      rows: [cart_product],
    } = await client.query(
      `
        UPDATE cart_products
        SET quantity = $1
        WHERE id = $2
        RETURNING *;
      `,
      [quantity, cart_product_id]
    );

    return cart_product;
  } catch (error) {
    console.error('Error updating cart');
    throw error;
  }
}

async function getCartProduct({ cart_product_id }) {
  try {
    const {
      rows: [cart_product],
    } = await client.query(
      `
        SELECT cp.*, c.user_id, c.is_active, c.status
        FROM cart_products cp
        LEFT JOIN carts c
          ON c.id = cp.cart_id
        WHERE cp.id = $1
      `,
      [cart_product_id]
    );

    return cart_product;
  } catch (error) {
    console.error('Error getting single cart product.');
    throw error;
  }
}

module.exports = {
  getAllCartItems,
  addCartItem,
  attachCartItems,
  updateCartItem,
  deleteCartItem,
  getCartProduct,
};
