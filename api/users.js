const express = require('express');
const {
  createUser,
  getUserById,
  getAllUsers,
  getUser,
  getUserByUsername,
  updateUser,
} = require('../db');
const jwt = require('jsonwebtoken');
const { requireUser, requireAdminUser } = require('./utils.js');
const usersRouter = express.Router();

// POST /api/users/register
usersRouter.post('/register', async (req, res, next) => {
  const { username, password, name, email } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists',
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      email,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1w',
      }
    );

    res.send({
      message: 'thank you for signing up',
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/users/login
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: 'MissingCredentialsError',
      message: 'Please supply both a username and password',
    });
  }

  try {
    const user = await getUser({ username, password });

    if (user) {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET
      );
      res.send({ message: "you're logged in!", token: token, user: user });
    } else {
      next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect',
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users/me
usersRouter.get('/me', requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users
usersRouter.get('/', requireAdminUser, async (req, res) => {
  try {
    const users = await getAllUsers();

    res.send({
      users,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
