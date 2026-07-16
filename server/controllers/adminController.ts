import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

//get all restaurant for admin management
//get/API/admin/restaurants
export const getAllRestaurantes = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurants = await Restaurant.find({})
      .populate("owner", "name email phone")
      .sort({ createdAT: -1 });
    res.json(restaurants);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//approve/reject/restaurant profile
//get/API/admin/restaurants/:id/approve
export const approveRestaurantes = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      res
        .status(400)
        .json({ message: "please provide a valid approval status" });
      return;
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ message: "restaurant profile not found" });
      return;
    }

    restaurant.status = status;
    await restaurant.save();

    res.json(restaurant);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

//get system statistics
//get/API/admin/stats
export const getAdminStats = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalBookings = await Booking.countDocuments({});
    const totalRestaurants = await Restaurant.countDocuments({});

    //get latest 10 bookings
    const latestBookings = await Booking.find({})
      .populate("user", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({
      users: {
        totalUsers,
        totalOwners,
        total: totalUsers + totalOwners,
      },
      restaurants: {
        total: totalRestaurants,
      },
      bookings: {
        total: totalBookings,
      },
      latestBookings,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
