import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { Booking } from "../models/Booking.js";

//create a new booking
//post/API/bookings
//@access private
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { restaurantId, date, time, guests, occasion, specialRequests } =
      req.body;
    if (!restaurantId || !date || !time || !guests) {
      res.status(400).json({
        message: "please provide all required reservation details",
      });
      return;
    }

    //check if resturant exsist
    const restaturant = await Restaurant.findById(restaurantId);
    if (!restaturant) {
      res.status(400).json({ message: "restaurant not found" });
      return;
    }

    // verified restaurant is approved
    if (restaturant.status !== "approved") {
      res.status(400).json({
        message: "reservations are not open for this restaurant",
      });
      return;
    }

    // verify seat availabe
    const requestGuests = Number(guests);
    const exsistingBookings = await Booking.find({
      restaurant: restaurantId,
      date: new Date(date),
      time,
      status: "confirmed",
    });

    const bookedSeats = exsistingBookings.reduce((sum, b) => sum + b.guests, 0);
    const totalSeats = restaturant.totalseats || 20;
    const availableSeats = totalSeats - bookedSeats;

    if (requestGuests > availableSeats) {
      res.status(400).json({
        message: `unable to reserve.only ${availableSeats} seats are availabe for this time slot.`,
      });
    }

    const booking = await Booking.create({
      user: req.user?._id,
      restaurant: restaurantId,
      date: new Date(date),
      time,
      guests: Number(guests),
      occasion,
      specialRequests,
      status: "confirmed",
    });

    // populate restaurant info before returning
    const populatedBooking = await booking.populate(
      "restaurant",
      "name location image address",
    );
    res.status(201).json(populatedBooking);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//create logged in user booking
//post/API/bookings/my
//@access private
export const getMyBookings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?._id })
      .populate("restaurant", "name location image address slug")
      .sort({ date: -1, time: -1 });

    res.json(bookings);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//cancel a booking
//post/API/bookings/:id/cancel
//@access private
export const cancelBookings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    //verify user own the booking
    if ((booking.user, toString() !== req.user?._id.toString())) {
      res.status(401).json({ message: "not authorized to cancel the booking" });
      return;
    }

    booking.status = "cancelled";
    await booking.save();

    const populatedBooking = await Booking.populate(
      "restaurant",
      "name location image address",
    );
    res.json(populatedBooking);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
