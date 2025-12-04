import express from "express";
import { body } from "express-validator";
import {
  captainLogout,
  getCaptainProfile,
  loginCaptain,
  registerCaptain,
} from "../controllers/captain.controller.js";
import { isAuthenticated } from "../middlewares/Auth.middleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("Firstname must be at least 3 characters"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("vehicle.color")
      .isLength({ min: 3 })
      .withMessage("Color must be at least 3 characters"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Plate must be at least 3 characters"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("vehicle.vehicleType")
      .isIn(["motorcycle", "car", "auto"])
      .withMessage("Invalid vehicle type"),
  ],
  registerCaptain
);
router.post("/login", loginCaptain);
router.get("/profile", isAuthenticated, getCaptainProfile);
router.get("/logout", isAuthenticated, captainLogout);

export default router;
