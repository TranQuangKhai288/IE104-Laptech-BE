import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

export const authAdminMiddleWare = async (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  console.log("tokenHeader Admin", tokenHeader);

  // If there is no token
  if (!tokenHeader) {
    return res.status(401).json({
      message: "Authentication failed - No token",
      status: "ERROR",
    });
  }

  // Extract the token
  const token = tokenHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, async (err, user) => {
    if (err) {
      return res.status(401).json({
        message: err.message,
        status: "ERROR",
      });
    }
    if (user?.isAdmin) {
      const setUser = await User.findOne({ _id: user.id });
      if (!setUser) {
        console.log("User not found");
        // throw new Error("User not found");
      }
      req.user = setUser; // Set req.user
      next();
    } else {
      return res.status(403).json({
        message: "Unauthorized",
        status: "ERROR",
      });
    }
  });
};

export const authUserMiddleWare = async (req, res, next) => {
  try {
    // Get token from the 'authorization' header
    const tokenHeader = req.headers.authorization;
    console.log("tokenHeader", tokenHeader);

    // If there is no token
    if (!tokenHeader) {
      return res.status(401).json({
        message: "Authentication failed",
        status: "ERROR",
      });
    }

    const token = tokenHeader.split(" ")[1];

    // Decode the token
    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: err.message,
          status: "ERROR",
        });
      }
      console.log("decoded", decoded);
      try {
        const user = await User.findOne({ _id: decoded.id });
        if (!user) {
          throw new Error("User not found");
        }
        req.user = user; // Set req.user
        next();
      } catch (error) {
        return res.status(401).json({
          message: error.message,
          status: "ERROR",
        });
      }
    });
  } catch (error) {
    console.log("error", error.message);
    res.status(401).send({ error: error.message });
  }
};
