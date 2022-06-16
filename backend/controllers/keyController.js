const Key = require("../models/keyModel.js");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");

const createKey = asyncHandler(async (req, res) => {
  const key = await Key.create({
    body: uuidv4(),
  });
  res.status(201).json(key);
});

const deleteKey = asyncHandler(async (req, res) => {
  const key = await Key.findById(req.params.id);
  if (!key) {
    res.status(400);
    throw new Error("Key does not exist.");
  }
  const deletedKey = await Key.findByIdAndDelete(req.params.id);
  res.status(200).json(deletedKey);
});

const getKeys = asyncHandler(async (req, res) => {
  const keys = await Key.find();
  res.status(200).json(keys);
});

module.exports = {
  createKey,
  deleteKey,
  getKeys,
};
