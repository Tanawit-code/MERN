// ควบคุมทุกอย่างที่เกี่ยวกับบัญชีผู้ใช้ เช่น:
// สมัครสมาชิก register
// ยืนยันอีเมล verifyEmail
// ส่งเมลยืนยันใหม่
// ล็อกอิน login
// ล็อกเอาต์ logout
// ดึงข้อมูลตัวเอง getMe
// อัปเดตโปรไฟล์ updateProfile
// ลืมรหัสผ่าน / รีเซ็ตรหัสผ่าน

// เวลาล็อกอินสำเร็จ controller นี้จะสร้าง JWT แล้ว set cookie ชื่อ token เพื่อให้ middleware ใช้ตรวจสอบ session ต่อได้

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import userModel from "../models/userModel.js";

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};


export const sendEmail = async (to, url = "#") => {


  await transporter.verify();
  console.log("SMTP READY");

  const info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject: "ยืนยันบัญชีของคุณ",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>ยืนยันอีเมลของคุณ</h2>
        <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมล</p>
        <a href="${url}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
          Verify Email
        </a>
        <p style="margin-top:16px;">หากปุ่มไม่ทำงาน ให้คัดลอกลิงก์นี้ไปเปิด:</p>
        <p>${url}</p>
      </div>
    `,
  });

  console.log("MAIL SENT:", info.response);
};

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
        message: "อีเมลนี้ถูกใช้งานแล้ว",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: verifyToken,
      verificationTokenExpire: Date.now() + 60 * 60 * 1000,
      isVerified: false,
    });

    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:5000"
      }/api/auth/verify-email?token=${verifyToken}`;

    try {
      await sendEmail(user.email, verifyUrl);
    } catch (emailError) {
      console.log("SEND EMAIL ERROR:", emailError.message);
      return res.status(500).json({
        success: false,
        message: "สมัครสำเร็จแต่ส่งอีเมลยืนยันไม่สำเร็จ",
      });
    }

    return res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
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

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?status=error&message=missing-token`
      );
    }

    const user = await userModel.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?status=error&message=invalid-or-expired`
      );
    }

    user.isVerified = true;
    user.verificationToken = "";
    user.verificationTokenExpire = 0;

    await user.save();

    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?status=success`
    );
  } catch (error) {
    console.log("VERIFY EMAIL ERROR:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?status=error&message=server-error`
    );
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ email",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบบัญชีผู้ใช้",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "บัญชีนี้ยืนยันอีเมลแล้ว",
      });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = verifyToken;
    user.verificationTokenExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:5000"
      }/api/auth/verify-email?token=${verifyToken}`;

    await sendEmail(user.email, verifyUrl);

    return res.status(200).json({
      success: true,
      message: "ส่งอีเมลยืนยันใหม่แล้ว",
    });
  } catch (error) {
    console.log("RESEND VERIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
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

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, bio, profilePic, coverPic } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้",
      });
    }

    if (typeof name === "string") user.name = name;
    if (typeof bio === "string") user.bio = bio;
    if (typeof profilePic === "string") user.profilePic = profilePic;
    if (typeof coverPic === "string") user.coverPic = coverPic;

    await user.save();

    return res.json({
      success: true,
      message: "อัปเดตโปรไฟล์สำเร็จ",
      user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุอีเมล",
      });
    }

    const user = await userModel.findOne({ email });

    // กันการเดาอีเมล: ตอบ success เหมือนกัน
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetOTP = resetToken;
    user.resetOTPExpire = Date.now() + 60 * 60 * 1000; // 1 ชั่วโมง
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail(user.email, resetUrl);

    return res.status(200).json({
      success: true,
      message: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว",
    });
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ token และรหัสผ่านใหม่",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
      });
    }

    const user = await userModel.findOne({
      resetOTP: token,
      resetOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = "";
    user.resetOTPExpire = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const sendResetPasswordEmail = async (to, url = "#") => {
  await transporter.verify();
  console.log("SMTP READY");

  const info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject: "รีเซ็ตรหัสผ่านของคุณ",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
        <a href="${url}" style="display:inline-block;padding:10px 16px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
        <p style="margin-top:16px;">หากปุ่มไม่ทำงาน ให้คัดลอกลิงก์นี้ไปเปิด:</p>
        <p>${url}</p>
      </div>
    `,
  });

  console.log("RESET MAIL SENT:", info.response);
};
export const requestAccountChange = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, password } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    // เปลี่ยนชื่อได้เลย
    if (name && name !== user.name) {
      user.name = name;
    }

    const emailChanged = email && email !== user.email;
    const passwordChanged = password && password.trim() !== "";

    if (!emailChanged && !passwordChanged) {
      await user.save();
      return res.json({ success: true, message: "อัปเดตสำเร็จ" });
    }

    // ตรวจ email ซ้ำ
    if (emailChanged) {
      const exist = await userModel.findOne({ email });
      if (exist && exist._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: "อีเมลนี้ถูกใช้งานแล้ว",
        });
      }
      user.pendingEmail = email;
    }

    // hash password ก่อนเก็บ
    if (passwordChanged) {
      const hashed = await bcrypt.hash(password, 10);
      user.pendingPassword = hashed;
    }

    // สร้าง token
    const token = crypto.randomBytes(32).toString("hex");
    user.changeVerifyToken = token;
    user.changeVerifyExpire = Date.now() + 30 * 60 * 1000;

    await user.save();

    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/confirm-change?token=${token}`;

    await sendEmail(user.email, verifyUrl);

    return res.json({
      success: true,
      message: "ส่งอีเมลยืนยันแล้ว",
      requireVerification: true,
    });
  } catch (err) {
    console.log("REQUEST CHANGE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const confirmAccountChange = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await userModel.findOne({
      changeVerifyToken: token,
      changeVerifyExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ success: false, message: "ลิงก์หมดอายุ" });
    }

    if (user.pendingEmail) {
      user.email = user.pendingEmail;
      user.pendingEmail = "";
      user.isVerified = true;
    }

    if (user.pendingPassword) {
      user.password = user.pendingPassword;
      user.pendingPassword = "";
    }

    user.changeVerifyToken = "";
    user.changeVerifyExpire = 0;

    await user.save();

    return res.json({
      success: true,
      message: "ยืนยันสำเร็จ",
    });
  } catch (err) {
    console.log("CONFIRM CHANGE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};