import { Router } from "express";
import {
  createOwnerRestaurant,
  getOwnerBookings,
  getOwnerRestaurant,
  updateBookingStatus,
  updateOwnerRestaurant,
} from "../controllers/ownerController.js";
import upload from "../database/multer.js";
import { Owner, Protect } from "../middlewares/auth.js";

const ownerRouter = Router();

ownerRouter.use(Protect);
ownerRouter.use(Owner);
ownerRouter.get("/restaurant", getOwnerRestaurant);
ownerRouter.post("/restaurant", upload.single("image"), createOwnerRestaurant);
ownerRouter.put("/restaurant", upload.single("image"), updateOwnerRestaurant);
ownerRouter.post("/bookings", getOwnerBookings);
ownerRouter.post("/bookings/:id/status", updateBookingStatus);

export default ownerRouter;
