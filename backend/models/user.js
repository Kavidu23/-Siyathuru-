// user.js (model)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pnumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["member", "leader", "admin"], default: "member" },
    city: { type: String, required: true },
    age: { type: Number },
    joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
  },
  { timestamps: true }
);

// Change this line
module.exports = mongoose.model("User", userSchema);