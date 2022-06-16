const express = require("express");
const {
  loginRequired,
  adminRequired,
} = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/bookingController");

const router = express.Router();

router.use(loginRequired);
router.route("/").get(getMyBookings).post(createBooking);

router.route("/:id").put(modifyBooking).delete(deleteBooking);

router.post("/:id/accept", acceptBooking);
router
  .route("/admin")
  .get(adminRequired, adminGetBookings)
  .post(adminRequired, adminCreateBooking);

router
  .route("/admin/:id")
  .delete(adminRequired, adminDeleteBooking)
  .put(adminRequired, adminModifyBooking);
router.get("/admin/conflicts", adminRequired, adminGetBookingConflicts);
router.post("/admin/:id/reject", adminRequired, adminRejectBooking);

module.exports = router;
