import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }
    const fallbackToken = req.headers["x-auth-token"];
    if (typeof fallbackToken === "string") {
        return fallbackToken;
    }
    return null;
};
export const Protect = async (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.secretkey);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("auth middleware error", error);
        res.status(401).json({ message: "Not authorized" });
    }
};
export const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    }
    else {
        res.status(403).json({ message: "Not authorized as admin" });
    }
};
export const Owner = (req, res, next) => {
    if (req.user && (req.user.role === "owner" || req.user.role === "admin")) {
        next();
    }
    else {
        res.status(403).json({ message: "Not authorized as owner" });
    }
};
