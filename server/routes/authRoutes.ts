import { Router } from "express";
import {
  getme,
  loginUser,
  registerUser,
} from "../controllers/authController.js";
import { Protect } from "../middlewares/auth.js";

const authRouter = Router();
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/me", Protect, getme);

export default authRouter;
