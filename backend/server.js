import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
<<<<<<< HEAD
import 'dotenv/config'
=======

>>>>>>> 8dcc28b3ab0fc7214123df53abac46840d33b729
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API Running welcome to backend");
});

app.get("/api/auth/register", (req, res) => {
  res.send("Register API Ready");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)

);

