const Project = require("../models/projectModel.js");
const asyncHandler = require("express-async-handler");

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find();
  res.status(200).json(projects);
});

const createProject = asyncHandler(async (req, res) => {
  const title = req.body.title ?? null;
  const description = req.body.description ?? null;
  const budget = req.body.budget ?? null;
  if (!title) {
    res.status(400);
    throw new Error("You must include a project title.");
  }
  const newProject = Project.create({
    title,
    description,
    budget,
  });
  res.status(201).json(newProject);
});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    res.status(400);
    throw new Error("Project does not exist");
  }

  const title = req.body.title ?? project.title;

  if (!title) {
    res.status(400);
    throw new Error("Project must include a title");
  }

  const description = req.body.description ?? project.description;
  const budget = req.body.budget ?? project.budget;

  const newProject = Project.findByIdAndUpdate(id, {
    title,
    budget,
    description,
  });
  res.status(200).json(newProject);
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.find();

  if (!project) {
    res.status(400);
    throw new Error("Project does not exist");
  }

  const newProject = Project.findByIdAndDelete(id);
  res.status(200).json(newProject);
});

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
