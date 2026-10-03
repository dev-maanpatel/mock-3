const mongoose = require("mongoose");
const EventSlot = require("../models/EventSlot");
const Booking = require("../models/Booking");

const bookSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, email, rollNo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot id"
      });
    }

    if (!studentName || !email) {
      return res.status(400).json({
        success: false,
        message: "Student name and email are required"
      });
    }

    const slot = await EventSlot.findById(id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found"
      });
    }

    if (slot.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: "This slot is closed"
      });
    }

    const duplicateBooking = await Booking.findOne({
      slotId: id,
      email: email.toLowerCase(),
      bookingStatus: "Booked"
    });

    if (duplicateBooking) {
      return res.status(400).json({
        success: false,
        message: "This email has already booked this slot"
      });
    }

    const activeBookings = await Booking.countDocuments({
      slotId: id,
      bookingStatus: "Booked"
    });

    if (activeBookings >= slot.capacity) {
      return res.status(400).json({
        success: false,
        message: "Slot is full"
      });
    }

    const booking = await Booking.create({
      slotId: id,
      studentName,
      email,
      rollNo
    });

    const updatedActiveBookings = activeBookings + 1;

    res.status(201).json({
      success: true,
      message: "Slot booked successfully",
      data: booking,
      availableSeats: slot.capacity - updatedActiveBookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getSlotBookings = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot id"
      });
    }

    const slot = await EventSlot.findById(id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found"
      });
    }

    const bookings = await Booking.find({
      slotId: id,
      bookingStatus: "Booked"
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      slot: slot.eventName,
      count: bookings.length,
      availableSeats: Math.max(slot.capacity - bookings.length, 0),
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking id"
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled"
      });
    }

    booking.bookingStatus = "Cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  bookSlot,
  getSlotBookings,
  cancelBooking
};
