const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: [true, "Please enter a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please enter an end date"],
    },
    details: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    email: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "modified"],
      default: "pending",
    },
    needsAdminInput: {
      type: Boolean,
      default: false,
    },
    needsUserInput: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
