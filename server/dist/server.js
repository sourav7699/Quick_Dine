import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./database/db.js";
import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import adminRouter from "./routes/adminRoute.js";
const app = express();
connectDB();
// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/admin", adminRouter);
//global error handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
    console.error("Unhandle Error", err);
    res.status(500).json({
        message: err.message || "Internal server error",
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
});
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("Server is Live!");
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
