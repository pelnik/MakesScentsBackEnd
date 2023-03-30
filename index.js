require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const client = require('./db/client');

const PORT = 3000;

app.use(cors());
app.use(morgan('dev'));

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log('<--- BODYLOGGER START --->');
  console.log(req.body);
  console.log('<--- BODYLOGGER END --->');
  next();
});

const apiRouter = require('./api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
