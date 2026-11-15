import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
export const Protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            //get token from header
            token = req.headers.authorization.split(" ")[1];
            //verify token
            const decoded = jwt.verify(token, process.env.secretkey);
            //get user from the token
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
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
        return;
    }
};
export const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    }
    else {
        res.status(403).json({ message: "Not authorized as admin " });
    }
};
export const Owner = (req, res, next) => {
    if (req.user && (req.user.role === "owner" || req.user.role === "admin")) {
        next();
    }
    else {
        res.status(403).json({ message: "Not authorized as owner " });
    }
};
