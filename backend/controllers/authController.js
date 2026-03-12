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

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      verifyOTP: verifyToken,
      verifyOTPExpire: Date.now() + 3600000
    });

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

    console.log("REGISTER ERROR:", error);

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
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    });

    res.json({
      success: true,
      user
    });
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    res.json({
      success: false,
      message: error.message
    });

  }

};

// ================= LOGOUT =================
export const logout = async (req, res) => {

  try {

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    })

    res.json({
      success: true,
      message: "Logout success"
    })

  } catch (error) {

    res.json({
      success: false,
      message: error.message
    })

  }

}

// ================= Getme =================
export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('-password')
    if (!user) {
      return res.json({
        success: false,
        message: "ไม่พบข้อมูลผู้ใช้"
      })
    }
    return res.json({
      success: true,
      user,
    })
  } catch {

  }
}


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

  const info = await transporter.sendMail({

    from: `"Rmutt" <freshjk24@gmail.com>`,
    to,

    subject: "ยืนยันบัญชีของคุณ",

    html: `
      <h2>ยืนยันอีเมลของคุณ</h2>

      <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมล</p>

      <a href="${url}"
      style="
        padding:12px 20px;
        background:#4CAF50;
        color:white;
        text-decoration:none;
        border-radius:5px;
      ">
        Verify Email
      </a>
    `

  });

};


// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {

  const { token } = req.query;

  const user = await userModel.findOne({
    verifyOTP: token,
    verifyOTPExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.send("ลิ้งยืนยันไม่ถูกต้องหรือหมดอายุแล้ว ❌");
  }

  user.isVerified = true;
  user.verifyOTP = "";
  user.verifyOTPExpire = 0;

  await user.save();

  res.send("ยืนยันอีเมลเรียบร้อย ✅");

};