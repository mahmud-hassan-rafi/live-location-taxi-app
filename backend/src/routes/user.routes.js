import express from "express";
import { body } from "express-validator";
import {
  getUserProfile,
  loginUser,
  registerUser,
  userLogout,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/Auth.middleware.js";

const router = express.Router();

// routes starts here
// register route
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("firstname")
      .isLength({ min: 3 })
      .withMessage("Firstname must be at least 3 characters"),
  ],
  registerUser
);

// login route
router.post("/login", loginUser);

// profile route
router.get("/profile", isAuthenticated, getUserProfile);

// logout route
router.get("/logout", userLogout);

export default router;
