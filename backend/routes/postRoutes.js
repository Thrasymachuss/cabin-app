const express = require("express");
const { loginRequired } = require("../middleware/authMiddleware");
const {
  getPostsNum,
  getPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();

router.route("/").get(loginRequired, getPosts).post(loginRequired, createPost);
router.get("/count", loginRequired, getPostsNum);

router
  .route("/:id")
  .put(loginRequired, updatePost)
  .delete(loginRequired, deletePost);

module.exports = router;
