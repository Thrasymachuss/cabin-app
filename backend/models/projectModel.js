const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title."],
    },
    description: {
      type: String,
      required: [true, "Please enter a description."],
    },
    budget: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
