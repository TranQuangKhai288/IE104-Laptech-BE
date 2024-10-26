import * as userService from "../services/user.js";
import * as JwtService from "../services/JwtService.js";
import User from "../models/user.js";

const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    }

    if (!reg.test(email)) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is email",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "The password is not equal to confirmPassword",
      });
    }

    const response = await userService.createUser(req.body);
    if (response === "Email is already existed") {
      return res.status(400).json({
        status: "ERR",
        message: "Email is already existed",
      });
    }

    if (response === "Error when create user") {
      return res.status(400).json({
        status: "ERR",
        message: "Error when create user",
      });
    }

    return res.status(201).json({
      status: "OK",
      message: "SUCCESS",
      data: response,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

    if (!email || !password) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    }

    if (!reg.test(email)) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is email",
      });
    }

    const response = await userService.loginUser(req.body);
    if (response === "User does not exist") {
      return res.status(400).json({
        status: "ERR",
        message: "User does not exist",
      });
    }

    if (response === "The password is incorrect") {
      return res.status(400).json({
        status: "ERR",
        message: "The password is incorrect",
      });
    }

    const { data, access_token, refresh_token } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({
      status: "OK",
      message: "LOGIN SUCCESS",
      data,
      access_token,
      refresh_token,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await userService.updateUser(userId, data);
    if (response === "The user is not defined") {
      return res.status(400).json({
        status: "ERR",
        message: "The user is not defined",
      });
    }

    if (response === "Error when update user") {
      return res.status(400).json({
        status: "ERR",
        message: "Error when update user",
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "SUCCESS",
      data: response,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await userService.deleteUser(userId);
    if (response === "The user is not defined") {
      return res.status(400).json({
        status: "ERR",
        message: "The user is not defined",
      });
    }

    if (response === "Error when delete user") {
      return res.status(400).json({
        status: "ERR",
        message: "Error when delete user",
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "SUCCESS",
      data: response,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    const response = await userService.getDetailsUser(userId);
    if (response === "The user is not defined") {
      return res.status(400).json({
        status: "ERR",
        message: "The user is not defined",
      });
    }

    if (response === "Error when get details user") {
      return res.status(400).json({
        status: "ERR",
        message: "Error when get details user",
      });
    }

    return res.status(200).json({
      status: "OK",
      message: "SUCCESS",
      data: response,
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(400).json({
        status: "ERR",
        message: "The token is required",
      });
    }

    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await userService.getAllUser();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

export default {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getUsers,
  getAllUser,
  getDetailsUser,
  refreshToken,
  logoutUser,
};
