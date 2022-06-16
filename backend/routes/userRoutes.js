const express = require("express");
const {
  registerUser,
  loginUser,
  adminGetAllUsers,
  getMe,
} = require("../controllers/userController");
const {
  loginRequired,
  adminRequired,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/all", loginRequired, adminRequired, adminGetAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", loginRequired, getMe);

module.exports = router;
