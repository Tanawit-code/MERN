import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import "dotenv/config";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5000']

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API Running welcome to backend");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});