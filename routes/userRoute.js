const express = require("express");
const User = require("../models/User");

const router = express.Router();

const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const emailFound = await User.findOne({ email });
    if (emailFound) {
      return res.status(400).json("Email already exists");
    }

    // Create a new user
    const createUser = await User.create({
      username,
      email,
      password,
    });
    if (createUser) {
      res.status(201).json({
        _id: createUser._id,
        username: createUser.username,
        email: createUser.email,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      res.json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          token,
        },
      });
    } else {
      res.status(401).json("Invalid email or password");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
