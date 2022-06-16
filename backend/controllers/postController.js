const Post = require("../models/postModel.js");
const Comment = require("../models/commentModel");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const getPostsNum = asyncHandler(async (req, res) => {
  res.status(200);
  res.json({ count: await Post.count() });
});

const getPosts = asyncHandler(async (req, res) => {
  const { postsLimit, startDate } = req.query;
  const query = Post.find({
    date: {
      $lt: startDate ?? new Date(8640000000000000),
    },
  })
    .limit(postsLimit ?? Number.POSITIVE_INFINITY)
    .sort({ date: -1 });

  res.status(200);
  res.json(await query);
});

const createPost = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error("Please include some text.");
  }
  const post = await Post.create({ text, user: req.user.id });
  res.status(201).json(post);
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const valid = mongoose.isValidObjectId(id);
  if (!valid) {
    res.status(400);
    throw new Error("Invalid id.");
  }

  const post = await Post.findById(id);

  if (!post) {
    res.status(400);
    throw new Error("Post does not exist.");
  }

  if (req.user.role !== "admin" && String(post?.user) !== req.user.id) {
    res.status(403);
    throw new Error(
      "You are not the creator of the specified post, so you cannot update it."
    );
  }

  const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true });
  res.status(200).json(updatedPost);
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const valid = mongoose.isValidObjectId(id);
  if (!valid) {
    res.status(400);
    throw new Error("Invalid id.");
  }

  const post = await Post.findById(id);
  if (!post) {
    res.status(400);
    throw new Error("Post does not exist.");
  }

  if (req.user.role !== "admin" && String(post?.user) !== req.user.id) {
    res.status(403);
    throw new Error(
      "You are not the creator of the specified post, so you cannot delete it."
    );
  }

  const deleted = await post.remove();
  const comments = await Comment.find({ postId: deleted.id });

  comments.forEach(async (comment) => {
    await comment.remove();
  });
  res.status(200).json(deleted);
});

module.exports = {
  getPostsNum,
  getPosts,
  createPost,
  updatePost,
  deletePost,
};
