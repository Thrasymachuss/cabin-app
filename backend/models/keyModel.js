const mongoose = require("mongoose");

const keySchema = mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Key", keySchema);
