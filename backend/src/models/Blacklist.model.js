import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 86400,
  },
});

const Blacklist = new mongoose.model("Blacklist", blacklistSchema);

export default Blacklist;
