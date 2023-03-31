const express = require("express");
const {
  createUser,
  getUserById,
  getAllUsers,
  getUser,
  getUserByUsername,
  updateUser,
  getUserByEmail,
} = require("../db");
const jwt = require("jsonwebtoken");
const { requireUser, requireAdminUser } = require("./utils.js");
const usersRouter = express.Router();

// POST /api/users/register
usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, email } = req.body;

  try {
    const _user = await getUserByUsername(username);
    const _email = await getUserByEmail(email);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    } else if (_email) {
      next({
        name: "EmailExistsError",
        message: "A user by that email already exists",
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
        expiresIn: "1w",
      }
    );

    res.send({
      success: true,
      message: "thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/users/login
usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUser({ username, password });

      if (!user) {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
      else if (!user.is_active) {
        next({
          name: "ProfileInactive",
          message: "Your profile in no longer active",
        });
    } 
      else {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET
      );
      res.send({
        success: true,
        message: "you're logged in!",
        token: token,
        user: user,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users/me * get single user info
usersRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send({ success: true, message: "users data", user: req.user });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users ** get all users
usersRouter.get("/", requireAdminUser, async (req, res) => {
  try {
    const users = await getAllUsers();

    res.send({
      success: true,
      users: users,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// PATCH /api/users/:userId * update user info
usersRouter.patch("/:userId", requireUser, async (req, res, next) => {
  const { userId } = req.params;
  const { username, email } = req.body;

  const updateFields = {};

  if (username) {
    updateFields.username = username;
  }
  if (email) {
    updateFields.email = email;
  }

  try {
    const _username = await getUserByUsername(username);
    const _email = await getUserByEmail(email);
    const _userId = await getUserById(userId);

    if (_username) {
      res.status(401);
      next({
        message: "A user with this username already exist",
        name: "UsernameAlreadyExist",
      });
    } else if (_email) {
      res.status(401);
      next({
        message: "A user with this email already exist",
        name: "EmailAlreadyExist",
      });
    } else {
      if (_userId.id === req.user.id) {
        const updatedUser = await updateUser({
          id: userId,
          ...updateFields,
        });
        res.send(updatedUser);
      } else if (_userId.id !== req.user.id) {
        res.status(403);
        next({
          message: "You cannot edit another users information",
          name: "UnauthorizedUserError",
        });
      }
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// PATCH /api/users/admin/:userId  ** update admin status/active status
usersRouter.patch(
  "/admin/:userId",
  requireAdminUser,
  async (req, res, next) => {
    const { userId } = req.params;
    const { is_active, is_admin } = req.body;

    const updateFields = {};

    if (is_active === true || is_active === false) {
      updateFields.is_active = is_active;
    }
    if (is_admin === true || is_admin === false) {
      updateFields.is_admin = is_admin;
    }

    try {
      const updatedUser = await updateUser({
        id: userId,
        ...updateFields,
      });
      res.send(updatedUser);
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

module.exports = usersRouter;
