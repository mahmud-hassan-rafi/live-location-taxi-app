import Blacklist from "../models/Blacklist.model.js";
import Captain from "../models/captain.models.js";
import { createCaptain } from "../services/captain.service.js";

export const registerCaptain = async (req, res) => {
  const { firstname, lastname, email, password, vehicle } = req.body;

  const isCaptainExists = await Captain.findOne({ email: email });
  if (isCaptainExists) {
    return res.status(400).json({ message: "Captain already exists" });
  }

  try {
    const captain = await createCaptain({
      firstname,
      lastname,
      email,
      password,
      vehicle,
    });

    const token = captain.generateAuthToken();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 86400 * 7,
    });
    return res.status(201).json({ token, captain });
  } catch (error) {
    // MongoDB UNIQUE items error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: `Server Error : ${error.message}`,
    });
  }
};

export const loginCaptain = async (req, res) => {
  const { email, password } = req.body;

  const captain = await Captain.findOne({ email }).select("+password");

  if (!captain) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const isPasswordMatched = await captain.comparePassword(password);
  if (!isPasswordMatched) {
    return res.status(401).json({ message: "Invalid email or password" });
  } else {
    const token = captain.generateAuthToken();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 86400 * 7,
    });
    return res.status(200).json({ isPasswordMatched, token, captain });
  }
};

export const getCaptainProfile = async (req, res) => {
  return res.status(200).json({ message: "welcome to the captain profile" });
};

export const captainLogout = async (req, res) => {
  res.clearCookie("token");
  const token =
    req.cookies.token || req.headers.authorization.replace("Bearer ", "");
  await Blacklist.create({ token: token });
  res.status(200).json({ message: "Logout done" });
};
