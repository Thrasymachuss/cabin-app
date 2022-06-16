const Booking = require("../models/bookingModel.js");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "youremail@gmail.com",
    pass: "yourpassword",
  },
});

// User booking controllers

const createBooking = asyncHandler(async (req, res) => {
  const { startDate, endDate, details } = req.body;
  const user = req.user;

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error("You must include a start date and end date.");
  }

  const email = req.body.email || user.email;
  if (!email) {
    res.status(400);
    throw new Error("No email can be found.");
  }

  const booking = await Booking.create({
    startDate,
    endDate,
    email,
    user: user._id,
    details,
  });

  res.status(201).json(booking);
});

const modifyBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const valid = mongoose.isValidObjectId(bookingId);

  if (!valid) {
    res.status(400);
    throw new Error("Invalid booking id.");
  }

  const booking = await Booking.findById(bookingId);
  const bookingUserId = String(booking.user._id);
  if (bookingUserId !== req.user.id) {
    res.status(400);
    throw new Error(
      "Either the booking specified does not exist, OR you were not the creator of the booking."
    );
  }

  const { startDate, endDate, details } = req.body;
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      startDate: startDate || booking.startDate,
      endDate: endDate || booking.endDate,
      details: details || booking.details,
      status: "pending",
    },
    { new: true }
  );

  res.status(200).json(updatedBooking);
});

const deleteBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const valid = mongoose.isValidObjectId(bookingId);
  if (!valid) {
    res.status(400);
    throw new Error("Invalid booking id.");
  }

  const booking = await Booking.findById(bookingId);
  if (String(booking?.user) !== req.user.id) {
    res.status(400);
    throw new Error(
      "Either the booking specified does not exist, OR you were not the creator of the booking."
    );
  }

  const deletedBooking = await Booking.findByIdAndDelete(bookingId);
  res.status(200).json(deletedBooking);
});

const acceptBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const valid = mongoose.isValidObjectId(bookingId);

  if (!valid) {
    res.status(400);
    throw new Error("Invalid object id.");
  }

  const booking = await Booking.findById(bookingId);

  if (String(booking?.user) !== req.user.id && req.user.role !== "admin") {
    res.status(400);
    throw new Error(
      "Either the booking specified does not exist, OR you were not the creator of the booking."
    );
  }

  if (
    (booking.status === "pending" && req.user.role !== "admin") ||
    (booking.status === "modified" && String(booking?.user) !== req.user.id)
  ) {
    res.status(403);
    throw new Error(
      "It is not your turn to change the status of this booking."
    );
  }

  const acceptedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: "accepted",
    },
    { new: true }
  );

  res.status(200).json(acceptedBooking);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    user: req.user._id,
  });
  res.status(200).json(bookings);
});

// Admin Booking Controllers

const adminCreateBooking = asyncHandler(async (req, res) => {
  const { startDate, endDate, details, userId } = req.body;
  const valid = mongoose.isValidObjectId(userId);

  if (!valid) {
    res.status(400);
    throw new Error("Invalid user id.");
  }

  const user = await User.findById(userId);

  if (!startDate || !endDate || !user) {
    res.status(400);
    throw new Error("You must include a start date, end date, and user.");
  }

  const email = req.body?.email || user.email;
  if (!email) {
    res.status(400);
    throw new Error("No email can be found.");
  }

  const status = user.id === req.user.id ? "accepted" : "modified";
  const booking = await Booking.create({
    startDate,
    endDate,
    email,
    user: user._id,
    details,
    status,
  });

  res.status(201).json(booking);
});

const adminDeleteBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const valid = mongoose.isValidObjectId(bookingId);

  if (!valid) {
    res.status(400);
    throw new Error("Invalid booking id.");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(400);
    throw new Error("The booking specified does not exist.");
  }

  const deletedBooking = await Booking.findByIdAndDelete(bookingId);
  res.status(200).json(deletedBooking);
});

const adminRejectBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const valid = mongoose.isValidObjectId(bookingId);

  if (!valid) {
    res.status(400);
    throw new Error("Invalid booking id.");
  }

  const details = req.body.details;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    res.status(400);
    throw new Error("The booking specified does not exist.");
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: "rejected",
      details,
    },
    { new: true }
  );
  res.status(200).json(updatedBooking);
});

const adminModifyBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const { startDate, endDate, details } = req.body;

  const valid = mongoose.isValidObjectId(bookingId);

  if (!valid) {
    res.status(400);
    throw new Error("Invalid booking id.");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(400);
    throw new Error("The booking specified does not exist.");
  }

  const modifiedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      startDate: startDate || booking.startDate,
      endDate: endDate || booking.endDate,
      details: details ?? booking.details,
      status: "modified",
    },
    { new: true }
  );

  res.status(200).json(modifiedBooking);
});

const adminGetBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ params });
  res.status(200).json(bookings);
});

const adminGetBookingConflicts = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ status: "accepted" });
  const { startDate, endDate } = req.query;
  const conflicts = bookings.filter((booking) => {
    if (
      (startDate >= booking.startDate && startDate < booking.endDate) ||
      (endDate > booking.startDate && endDate <= booking.endDate)
    ) {
      return true;
    }

    return false;
  });

  res.status(200).json(conflicts);
});

module.exports = {
  createBooking,
  modifyBooking,
  deleteBooking,
  acceptBooking,
  getMyBookings,
  adminCreateBooking,
  adminDeleteBooking,
  adminGetBookingConflicts,
  adminGetBookings,
  adminModifyBooking,
  adminRejectBooking,
};
