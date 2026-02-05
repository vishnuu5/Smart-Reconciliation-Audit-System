import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validateEmail, validatePassword } from "../middleware/validation.js";
import AuditLog from "../models/AuditLog.js";
import { AUDIT_ACTIONS, AUDIT_SOURCES } from "../config/constants.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const register = async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Valid email required",
    });
  }

  if (!password || !validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  if (!name || name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Name required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    const user = await User.create({
      email,
      password,
      name,
      role: role || "Analyst",
    });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    await AuditLog.create({
      userId: user._id,
      action: AUDIT_ACTIONS.UPDATE,
      source: AUDIT_SOURCES.SYSTEM,
      description: "User login",
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
