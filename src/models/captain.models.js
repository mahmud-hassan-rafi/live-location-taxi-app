import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const CaptainSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, "Firstname must be at least 3 characters"],
    },
    lastname: { type: String, default: "" },
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  captainStatus: {
    type: String,
    enum: ["available", "unavailable"],
    default: "unavailable",
  },
  vehicle: {
    color: {
      type: String,
      required: true,
      minlength: [3, "Color must be at least 3 characters"],
    },
    plate: {
      type: String,
      required: true,
      unique: true,
      minlength: [3, "Plate must be at least 3 characters"],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "Capacity must be at least 1"],
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ["motorcycle", "car", "auto"],
    },
  },
});

CaptainSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email, role: "captain" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

CaptainSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

CaptainSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};
const Captain = mongoose.model("Captain", CaptainSchema);

export default Captain;
