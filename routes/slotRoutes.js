const express = require("express");
const router = express.Router();

const {
  createSlot,
  getAllSlots,
  getSlotById,
  deleteSlot
} = require("../controllers/slotController");

const {
  bookSlot,
  getSlotBookings
} = require("../controllers/bookingController");

router.post("/", createSlot);
router.get("/", getAllSlots);
router.get("/:id", getSlotById);
router.post("/:id/book", bookSlot);
router.get("/:id/bookings", getSlotBookings);
router.delete("/:id", deleteSlot);

module.exports = router;
