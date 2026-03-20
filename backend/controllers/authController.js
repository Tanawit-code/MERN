import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// ================= CREATE TOKEN =================
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ================= COOKIE OPTIONS =================
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอก name, email และ password ให้ครบ",
      });
    }

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      verifyOTP: verifyToken,
      verifyOTPExpire: Date.now() + 60 * 60 * 1000,
    });

    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/verify-email?token=${verifyToken}`;

    try {
      await sendEmail(user.email, verifyUrl);
    } catch (emailError) {
      console.log("SEND EMAIL ERROR:", emailError.message);
    }

    const token = createToken(user._id);
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: "Register success. Check your email",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอก email และ password",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Wrong password",
      });
    }

    const token = createToken(user._id);
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout success",
    });
  } catch (error) {
    console.log("LOGOUT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ME =================
export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("GET ME ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEND EMAIL =================
export const sendEmail = async (to, url) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Rmutt" <no-reply@rmutt.local>',
    to,
    subject: "ยืนยันบัญชีของคุณ",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>ยืนยันอีเมลของคุณ</h2>
        <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมล</p>
        <a href="${url}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
          Verify Email
        </a>
      </div>
    `,
  });
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await userModel.findOne({
      verifyOTP: token,
      verifyOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.send("ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว ❌");
    }

    user.isVerified = true;
    user.verifyOTP = "";
    user.verifyOTPExpire = 0;

    await user.save();

    return res.send("ยืนยันอีเมลเรียบร้อย ✅");
  } catch (error) {
    console.log("VERIFY EMAIL ERROR:", error);
    return res.status(500).send("เกิดข้อผิดพลาดในการยืนยันอีเมล");
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    if (req.file) {
      if (user.profilePic) {
        const oldPath = path.join(process.cwd(), user.profilePic);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      user.profilePic = req.file.path.replace(/\\/g, "/");
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "อัปเดตข้อมูลผู้ใช้สำเร็จ",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};