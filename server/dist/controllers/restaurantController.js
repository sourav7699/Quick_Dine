import { Restaurant } from "../models/Restaurant.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";
//get all restaurants with search and filters
//get/API/restaurants
export const getRestaurants = async (req, res) => {
    try {
        const { search, priceRange, rating, location, sort } = req.query;
        //build query object
        const queryObj = { status: "approved" };
        if (search) {
            queryObj.$or = [
                { name: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }
        if (priceRange) {
            const prices = Array.isArray(priceRange) ? priceRange : [priceRange];
            queryObj.priceRange = { $in: prices };
        }
        if (rating) {
            queryObj.rating = { $gte: parseFloat(rating) };
        }
        if (location) {
            queryObj.location = { $regex: location, $options: "i" };
        }
        //sorting
        let sortOption = { createdAt: -1 };
        if (sort === "rating") {
            sortOption = { rating: -1 };
        }
        else if (sort === "price_low") {
            sortOption = { priceRange: 1 };
        }
        else if (sort === "price_high") {
            sortOption = { priceRange: -1 };
        }
        const restaurant = await Restaurant.find(queryObj).sort(sortOption);
        res.json(restaurant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
//get all featured and exclusive
//get/API/resturants
export const getFeaturedRestaurants = async (req, res) => {
    try {
        const featured = await Restaurant.find({
            status: "approved",
            $or: [{ featured: true }, { exclusive: true }],
        }).limit(6);
        res.json(featured);
    }
    catch (error) {
        console.error("getFeaturedRestaurants error:", error);
        res.status(500).json({ message: "Failed to fetch featured restaurants" });
    }
};
//get single resturant by slug
//get/API/resturants
export const getRestaurantBySlug = async (req, res) => {
    try {
        const resturant = await Restaurant.findOne({ slug: req.params.slug });
        if (!resturant) {
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }
        //if not approved, verify authorization (admin or owner)
        if (resturant.status !== "approved") {
            let isAuthorized = false;
            const authHeader = req.headers.authorization;
            if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
                try {
                    const token = authHeader.split(" ")[1];
                    const decoded = jwt.verify(token, process.env.secretkey);
                    const user = await User.findById(decoded.id);
                    if (user &&
                        (user.role === "admin" ||
                            (user.role === "owner" &&
                                resturant.owner.toString() === user._id.toString()))) {
                        isAuthorized = true;
                    }
                }
                catch (error) {
                    //ignore if verify error
                }
            }
            if (!isAuthorized) {
                res.status(404).json({ message: "Restaurant not found" });
                return;
            }
        }
        res.json(resturant);
    }
    catch (error) {
        console.error("getResturantBySlug error:", error);
        res.status(400).json({ message: "Failed to fetch restaurant" });
    }
};
//get dynamic seat availability for slots
//get/API/resturants/:id/availability
export const getRestaurantAvailability = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            res.status(400).json({ message: "please provide a Date" });
            return;
        }
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            res.status(404).json({ message: "Restaurant not found" });
            return;
        }
        const bookingdate = new Date(date);
        // get all active booking on this date for the resturant
        const bookings = await Booking.find({
            restaurant: restaurant._id,
            date: bookingdate,
            status: "confirmed",
        });
        //map slot to available capacities
        const availability = restaurant.availableSlots.map((slot) => {
            const bookedSeats = bookings
                .filter((b) => b.time === slot)
                .reduce((sum, b) => sum + b.guests, 0);
            const totalSeats = restaurant.totalSeats || 20;
            const availableSeats = Math.max(0, totalSeats - bookedSeats);
            return {
                time: slot,
                availableSeats,
                isAvailable: availableSeats > 0,
            };
        });
        res.json(availability);
    }
    catch (error) {
        console.error("getRestaurantAvailability error:", error);
        res
            .status(500)
            .json({ message: "Failed to fetch restaurant availability" });
    }
};
