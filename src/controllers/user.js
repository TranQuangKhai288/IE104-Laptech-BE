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

    // 1. Input Validation
    if (!email || !password) {
      return res.status(400).json({
        status: "ERR",
        message: "Email and password are required",
      });
    }

    // Email validation - using more comprehensive regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid email format",
      });
    }

    // 2. Password validation (thêm nếu cần)
    // if (password.length < 6) {
    //   return res.status(400).json({
    //     status: "ERR",
    //     message: "Password must be at least 6 characters long",
    //   });
    // }

    // 3. Sanitize input
    // const sanitizedEmail = email.toLowerCase().trim();

    // 4. Call service with sanitized input
    const response = await userService.loginUser({
      email: email,
      password,
    });

    // 5. Handle service responses
    if (typeof response === "string") {
      return res.status(401).json({
        status: "ERR",
        message: response,
      });
    }

    // 6. Destructure response
    const { data, access_token, refresh_token } = response;

    // 7. Set refresh token in cookie
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Chỉ true trong production
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 8. Return response without refresh token in body
    return res.status(200).json({
      status: "OK",
      message: "LOGIN_SUCCESS",
      data,
      access_token,
      // Không nên gửi refresh_token trong response body
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({
      status: "ERR",
      message: "Internal server error",
      // Không nên gửi e.message trong production vì có thể lộ thông tin nhạy cảm
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
    const { search, page = 1, limit = 10 } = req.query;

    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({ ...keyword })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments({ ...keyword });

    return res.status(200).json({
      status: "OK",
      message: "SUCCESS",
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.user._id;
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
    console.log("req.cookies", req.cookies);
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
