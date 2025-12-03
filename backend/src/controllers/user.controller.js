import BlacklistModel from "../models/Blacklist.model.js";
import userModel from "../models/user.models.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from "express-validator";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.body);
  const { firstname, lastname, email, password } = req.body;
  const hashedPassword = await userModel.hashPassword(password);

  const user = await createUser({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });
  const token = user.generateAuthToken();

  return res.status(201).json({ token, user });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return res.status(401).json({ message: "Invalid email or password" });
  } else {
    const token = user.generateAuthToken();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 86400 * 7,
    });
    return res.status(200).json({ isPasswordMatched, token, user });
  }
};

export const getUserProfile = (req, res) => {
  return res.status(200).json({ message: "welcome to the profile" });
};

export const userLogout = async (req, res) => {
  res.clearCookie("token");
  const token =
    req.cookies.token || req.headers.authorization.replace("Bearer ", "");
  await BlacklistModel.create({ token: token });

  res.status(200).json({ message: "Logout done" });
};
