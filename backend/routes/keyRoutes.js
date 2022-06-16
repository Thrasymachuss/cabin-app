const express = require("express");
const {
  createKey,
  deleteKey,
  getKeys,
} = require("../controllers/keyController");
const {
  loginRequired,
  adminRequired,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use([loginRequired, adminRequired]);
router.route("/").get(getKeys).post(createKey);
router.delete("/:id", deleteKey);

module.exports = router;
