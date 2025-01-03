const express = require("express");
const Message = require("../models/Chat");
const { protect } = require("../middlewares/auth");
const messageRouter = express.Router();

messageRouter.post("/", protect, async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      content,
      group: groupId,
    });
    const populate = await Message.findById(message._id)
      .populate("sender", "username email")
      .populate("group", "name");
    res.status(201).json({
      populate,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
messageRouter.get("/:groupId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "username email")
      .populate("group", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ messages });
  } catch (error) {}
});
module.exports = messageRouter;
