import mongoose from "mongoose";

const { Schema } = mongoose;

const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: false },
  label: { type: String, required: false }, // e.g., "Home", "Office"
});

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    birthDate: { type: Date },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    phone: { type: String },
    isAdmin: { type: Boolean, default: false },
    addresses: { type: [addressSchema], default: [] }, // Array of addresses
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
