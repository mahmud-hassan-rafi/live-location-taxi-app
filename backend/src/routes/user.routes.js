import express from "express";
import { body } from "express-validator";
import { registerUser } from "../controllers/user.controller.js";

const router = express.Router();

// routes starts here
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

export default router;
