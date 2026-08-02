import { Router } from "express";
import {
  approveRestaurantes,
  getAdminStats,
  getAllRestaurantes,
} from "../controllers/adminController.js";
import { admin, Protect } from "../middlewares/auth.js";

const adminRouter = Router();
adminRouter.use(Protect);
adminRouter.use(admin);

adminRouter.get("/restaurants", getAllRestaurantes);
adminRouter.put("/restaurants/:id/approve", approveRestaurantes);
adminRouter.get("/stats", getAdminStats);

export default adminRouter;
