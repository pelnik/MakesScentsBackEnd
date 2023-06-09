const express = require('express');
const apiRouter = express.Router();
const { JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');

//setting `req.user`
apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

// GET /api/health
apiRouter.get('/health', async (req, res, next) => {
  res.send({
    message: 'All is well',
  });
});

// ROUTER: /api/users
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);


// ROUTER: /api/carts
const cartsRouter = require('./carts');
apiRouter.use('/carts', cartsRouter);

// ROUTER: /api/products
const productsRouter = require('./products');
apiRouter.use('/products', productsRouter);

// ROUTER: /api/carts_products_router
const cartProductsRouter = require('./cart_products');
apiRouter.use('/cart_products', cartProductsRouter);

// ROUTER: /api/categoriesRouter
const categoriesRouter = require('./categories');
apiRouter.use('/categories', categoriesRouter);

//error handling
apiRouter.use('*', (req, res, next) => {
  res.status(404);
  res.send({
    success: false,
    name: 'PathDoesNotExist',
    message: 'Path does not exist',
  });
});

apiRouter.use((error, req, res, next) => {
  res.status(400);
  res.send({
    success: false,
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
