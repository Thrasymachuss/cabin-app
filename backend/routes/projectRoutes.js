const express = require("express");
const {
  loginRequired,
  adminRequired,
} = require("../middleware/authMiddleware");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

router.use([loginRequired, adminRequired]);

router.route("/").get(getProjects).post(createProject);

router.route("/:id").put(updateProject).delete(deleteProject);

module.exports = router;
