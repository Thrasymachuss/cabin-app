const mongoose = require("mongoose");
const Post = require("../models/postModel.js");
const Comment = require("../models/commentModel.js");
const asyncHandler = require("express-async-handler");

const getCommentsNum = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const valid = mongoose.isValidObjectId(postId);

  if (!valid) {
    res.status(400);
    throw new Error("Invalid id.");
  }

  const commentCount = await Comment.count({
    post: postId,
  });
  res.status(200);
  res.json({ count: commentCount });
});

const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const valid = mongoose.isValidObjectId(postId);
  if (!valid) {
    res.status(400);
    throw new Error("Invalid id.");
  }

  const comments = await Comment.find({
    post: postId,
  });
  res.status(200);
  res.json(comments);
});

const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.body;

  const valid = mongoose.isValidObjectId(postId);
  if (!valid) {
    res.status(400);
    throw new Error("Invalid id.");
  }

  const post = await Post.findById(postId);
  if (!post) {
    res.status(400);
    throw new Error("Post does not exist.");
  }

  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error("Your comment must include some text.");
  }

  const newComment = await Comment.create({
    text,
    post: post._id,
    user: req.user._id,
  });

  res.status(201).json(newComment);
});

const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { postId } = req.body;

  const valid =
    mongoose.isValidObjectId(postId) && mongoose.isValidObjectId(id);
  if (!valid) {
    res.status(400);
    throw new Error("Invalid id.");
  }

  const post = await Post.findById(postId);
  const comment = await Comment.findById(id);
  if (!post || !comment) {
    res.status(400);
    throw new Error("Post or comment does not exist.");
  }

  if (req.user.role !== "admin" && String(comment.user) !== req.user.id) {
    res.status(403);
    throw new Error("You are not allowed to edit this comment.");
  }

  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error("Your comment must include some text.");
  }

  const updatedComment = await Comment.findByIdAndUpdate(id, {
    text,
    post: post._id,
    user: req.user._id,
  });

  res.status(200).json(updatedComment);
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const valid = mongoose.isValidObjectId(id);
  if (!valid) {
    res.status(400);
    throw new Error("Invalid id.");
  }

  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(400);
    throw new Error("Post or comment does not exist.");
  }

  if (req.user.role !== "admin" && String(comment.user) !== req.user.id) {
    res.status(403);
    throw new Error("You are not allowed to edit this comment.");
  }

  const deletedComment = await Comment.findByIdAndDelete(id);

  res.status(200).json(deletedComment);
});

module.exports = {
  getComments,
  getCommentsNum,
  createComment,
  updateComment,
  deleteComment,
};
