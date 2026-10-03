const mongoose = require("mongoose");

const eventSlotSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EventSlot", eventSlotSchema);
