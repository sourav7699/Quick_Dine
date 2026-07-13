import { Router } from "express";
import { Protect } from "../middlewares/auth.js";
import {
  cancelBookings,
  createBooking,
  getMyBookings,
} from "../controllers/bookingController.js";

const bookingRouter = Router();

bookingRouter.post("/", Protect, createBooking);
bookingRouter.post("/my", Protect, getMyBookings);
bookingRouter.post("/:id/cancel", Protect, cancelBookings);

export default bookingRouter;
