const client = require("./client");

// create and return the new product
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
    if (!(size === "S" || size === "M" || size === "L")) {
      throw new Error("Size is not S, M, or L");
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
    console.error("error creating product", error);
    throw error;
  }
}

// return an array of all products
async function getAllProducts() {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM products;
      `
    );

    return rows;
  } catch (error) {
    console.error("error getting all products", error);
    throw error;
  }
}

// return a single product product
async function getProductById(id) {
  try {
    const { rows: [product] } = await client.query(
      `
      SELECT FROM products
      WHERE id = ${id};
      `
    )

    return product;
  } catch (error) {
    console.error("error getting product by id", error);
    throw error
  }
}

// update product detail except for id and return updated product
async function updateProduct(id, ...fields) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}" = $${index + 1}`)
    .join(", ");

  try {
    const {
      rows: [product],
    } = await client.query(
      `
      UPDATE products
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
      `,
      Object.values(fields)
    );

    return product;
  } catch (error) {
    console.error("error updating product");
    throw error;
  }
}

// remove a product by its id  
async function destroyProduct(id) {
  try {
    await client.query(
      `
      DELETE FROM cart_products
      WHERE product_id = ${id};

      DELETE FROM products
      WHERE id = ${id};
      `
    );
  } catch (error) {
    console.error("error deleting product", error);
    throw error;
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  destroyProduct,
};
