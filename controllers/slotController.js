const mongoose = require("mongoose");
const EventSlot = require("../models/EventSlot");
const Booking = require("../models/Booking");

const createSlot = async (req, res) => {
  try {
    const { eventName, date, startTime, endTime, location, capacity, status } = req.body;

    if (!eventName || !date || !startTime || !endTime || !location || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required"
      });
    }

    if (Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be greater than 0"
      });
    }

    const slot = await EventSlot.create({
      eventName,
      date,
      startTime,
      endTime,
      location,
      capacity,
      status
    });

    res.status(201).json({
      success: true,
      message: "Event slot created successfully",
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllSlots = async (req, res) => {
  try {
    const slots = await EventSlot.find().sort({ createdAt: -1 });

    const result = await Promise.all(
      slots.map(async (slot) => {
        const activeBookings = await Booking.countDocuments({
          slotId: slot._id,
          bookingStatus: "Booked"
        });

        return {
          ...slot.toObject(),
          activeBookings,
          availableSeats: Math.max(slot.capacity - activeBookings, 0)
        };
      })
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getSlotById = async (req, res) => {
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

    const activeBookings = await Booking.countDocuments({
      slotId: slot._id,
      bookingStatus: "Booked"
    });

    res.status(200).json({
      success: true,
      data: {
        ...slot.toObject(),
        bookingCount: activeBookings,
        availableSeats: Math.max(slot.capacity - activeBookings, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteSlot = async (req, res) => {
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

    const activeBookings = await Booking.countDocuments({
      slotId: id,
      bookingStatus: "Booked"
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete slot because active bookings exist"
      });
    }

    await EventSlot.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Slot deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSlot,
  getAllSlots,
  getSlotById,
  deleteSlot
};
