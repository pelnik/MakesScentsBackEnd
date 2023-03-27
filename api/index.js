const express = require('express');
const apiRouter = express.Router();

console.log('using API router');

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
