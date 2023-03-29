const express = require('express');
const categoriesRouter = express.Router();

const { requireAdminUser } = require('./utils');
const { createCategory } = require('../db/categories');

// Close old cart and get new one
categoriesRouter.post('/', requireAdminUser, async (req, res, next) => {
  try {
    const { category_name } = req.body;

    if (category_name) {
      const newCategory = await createCategory({ category_name });

      if (newCategory) {
        res.send({
          success: true,
          message: 'New category created',
          category: newCategory,
        });
      } else
        next({
          name: 'Error creating category',
          message: 'Likely duplicate category name was used',
        });
    } else {
      next({
        name: 'MustIncludeCategoryName',
        message: 'You must send category name to update that.',
      });
    }
  } catch ({ name, message }) {
    next({
      name,
      message,
    });
  }
});

module.exports = categoriesRouter;
