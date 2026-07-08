import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./database/db.js";

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
