const express = require("express");

const Group = require("../models/Group");
const groupRouter = express.Router();

groupRouter.post("/", async () => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      //   admin: req.user._id,
      // members:[req.user._id]
    });
    const populate = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");
    res.status(201).json({ populate });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = groupRouter;
