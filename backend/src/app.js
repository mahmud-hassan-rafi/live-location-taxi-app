import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectToDB from "./config/db.js";
import userRouter from "./routes/user.routes.js";
dotenv.config();

const app = express();
connectToDB();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  res.send("Hello, World! It's working.");
});

app.use("/api/users", userRouter);

export default app;
