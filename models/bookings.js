import mongoose, { Schema } from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    home: {
      type: Schema.Types.ObjectId,
      ref: "Home",
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;