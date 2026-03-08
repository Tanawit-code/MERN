import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";


// ================= REGISTER =================
export const register = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      verifyOTP: verifyToken,
      verifyOTPExpire: Date.now() + 3600000
    });

    await user.save();

    const verifyUrl =
      `http://localhost:5000/api/auth/verify-email?token=${verifyToken}`;

    await sendEmail(user.email, verifyUrl);

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: "Register success. Check your email"
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }
};


// ================= LOGIN =================
export const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({
        success: false,
        message: "Wrong password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true
    });

    res.json({
      success: true
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message
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
      pass: process.env.SMTP_PASS
    }
  });

 await transporter.sendMail({
  from: '"Rmutt" <freshjk24@gmail.com>',   // ต้องเป็น email ที่ verify
  to,
  subject: "Verify your account",
  html: `
    <h2>Email Verification</h2>
    <a href="${url}">Verify Account</a>
  `
});

const info = await transporter.sendMail({
  from: `"MERN App" <${process.env.SMTP_USER}>`,
  to,
  subject: "Verify your account",
  html: `<a href="${url}">Verify</a>`
});

console.log("Message ID:", info.messageId);
  console.log("Email sent to:", to);
};


// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {

  const { token } = req.query;

  const user = await userModel.findOne({
    verifyOTP: token,
    verifyOTPExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.send("Invalid or expired token");
  }

  user.isVerified = true;
  user.verifyOTP = "";
  user.verifyOTPExpire = 0;

  await user.save();

  res.send("Email verified successfully ✅");

};