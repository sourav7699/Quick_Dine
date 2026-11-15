import { Router } from "express";
import { Protect } from "../middlewares/auth.js";
import {
  cancelBookings,
  createBooking,
  getMyBookings,
} from "../controllers/bookingController.js";

const bookingRouter = Router();

bookingRouter.post("/", Protect, createBooking);
bookingRouter.get("/my", Protect, getMyBookings);
bookingRouter.put("/:id/cancel", Protect, cancelBookings);

export default bookingRouter;
