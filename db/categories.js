const client = require('./client');

async function createCategory({ category_name }) {
  try {
    const {
      rows: [category],
    } = await client.query(
      `
        INSERT INTO categories(category_name)
        VALUES($1)
        ON CONFLICT DO NOTHING
        RETURNING *;
      `,
      [category_name]
    );

    return category;
  } catch (error) {
    console.error('error creating category', error);
    throw error;
  }
}

async function getAllCategories() {
  try {
    const { rows } = await client.query(
      `
      SELECT *
      FROM categories;
      `
    );

    return rows;
  } catch (error) {
    console.error('error getting all categories', error);
    throw error;
  }
}

module.exports = {
  createCategory,
  getAllCategories,
};
