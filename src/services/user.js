import User from "../models/user.js";
import bcrypt from "bcrypt";
import { genneralAccessToken, genneralRefreshToken } from "./JwtService.js";

export const createUser = async (newUser) => {
  const { name, email, password } = newUser;

  // Check if email already exists
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return "Email is already existed";
    }

    const hash = bcrypt.hashSync(password, 10);
    const defaultAvatar =
      "https://cdn-icons-png.freepik.com/512/8742/8742495.png";

    const createdUser = await User.create({
      name,
      email,
      password: hash,
      avatar: defaultAvatar,
    });

    return createdUser;
  } catch (e) {
    console.error(e, "Error when creating user");
    return "Error when creating user";
  }
};

export const loginUser = async (userLogin) => {
  const { email, password } = userLogin;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return "User does not exist";
    }

    const comparePassword = bcrypt.compareSync(password, checkUser.password);
    if (!comparePassword) {
      return "The password is incorrect";
    }

    const access_token = await genneralAccessToken({
      id: checkUser.id,
      isAdmin: checkUser.isAdmin,
    });

    const refresh_token = await genneralRefreshToken({
      id: checkUser.id,
      isAdmin: checkUser.isAdmin,
    });

    return {
      data: checkUser,
      access_token,
      refresh_token,
    };
  } catch (e) {
    console.error(e, "Error when logging in user");
    return "Error when logging in user";
  }
};

export const updateUser = async (id, data) => {
  try {
    const checkUser = await User.findById(id);
    if (!checkUser) {
      return "The user is not defined";
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
    return updatedUser;
  } catch (e) {
    console.error(e, "Error when updating user");
    return "Error when updating user";
  }
};

export const deleteUser = async (id) => {
  try {
    const checkUser = await User.findById(id);
    if (!checkUser) {
      return "The user is not defined";
    }

    await User.findByIdAndDelete(id);
    return checkUser;
  } catch (e) {
    console.error(e, "Error when deleting user");
    return "Error when deleting user";
  }
};

export const getDetailsUser = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return "The user is not defined";
    }
    return user;
  } catch (e) {
    console.error(e, "Error when getting details user");
    return "Error when getting details user";
  }
};

// Get all users
export const getAllUser = async () => {
  try {
    const allUser = await User.find().sort({ createdAt: -1, updatedAt: -1 });
    return {
      status: "OK",
      message: "Success",
      data: allUser,
    };
  } catch (e) {
    console.error(e, "Error when getting all users");
    return { status: "ERR", message: "Error when getting all users" };
  }
};
