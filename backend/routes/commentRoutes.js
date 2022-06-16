const express = require("express");
const { loginRequired } = require("../middleware/authMiddleware");
const {
  getComments,
  getCommentsNum,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();
router.use(loginRequired);

router.post("/", createComment);
router.route("/:id").put(updateComment).delete(deleteComment);
router.get("/bypost/:postId/count", getCommentsNum);
router.get("/bypost/:postId", getComments);

module.exports = router;
