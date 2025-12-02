import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: [3, "Firstname must be at least 3 characters"],
  },
  lastName: {
    type: String,
    minlength: [3, "Lastname must be at least 3 characters"],
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  socketID: { type: String },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
