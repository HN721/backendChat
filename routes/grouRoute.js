const express = require("express");

const Group = require("../models/Group");
const groupRouter = express.Router();
const { protect, isAdmin } = require("../middlewares/auth");
groupRouter.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });
    const populate = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");
    res.status(201).json({ populate });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
groupRouter.get("/get-all", protect, async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate("admin", "username email")
      .populate("members", "username email");
    res.status(200).json({ groups });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
//join
groupRouter.post("/:groupId/join", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already joined" });
    }
    group.members.push(req.user._id);
    await group.save();
    res.status(200).json({ message: "Joined group successfully" });
  } catch (error) {}
});
groupRouter.post("/:groupId/leave", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Not a member of the group" });
    }
    group.members.pull(req.user._id);
    await group.save();
    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = groupRouter;
