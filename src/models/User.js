import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // Adaugă automat câmpurile `createdAt` și `updatedAt` în documente
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
