// ควบคุมทุกอย่างที่เกี่ยวกับบัญชีผู้ใช้ เช่น:
// สมัครสมาชิก register
// ยืนยันอีเมล verifyEmail
// ส่งเมลยืนยันใหม่
// ล็อกอิน login
// ล็อกเอาต์ logout
// ดึงข้อมูลตัวเอง getMe
// อัปเดตโปรไฟล์ updateProfile
// ลืมรหัสผ่าน / รีเซ็ตรหัสผ่าน

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import userModel from "../models/userModel.js";

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendBrevoEmail = async (to, subject, html) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "Rmutt", email: "freshjk24@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Brevo API error");
  }

  console.log("MAIL SENT via Brevo API to:", to);
};

export const sendEmail = async (to, url = "#") => {
  console.log("SEND EMAIL TO:", to);
  await sendBrevoEmail(
    to,
    "ยืนยันบัญชีของคุณ",
    `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>ยืนยันอีเมลของคุณ</h2>
      <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมล</p>
      <a href="${url}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
        Verify Email
      </a>
      <p style="margin-top:16px;">หากปุ่มไม่ทำงาน ให้คัดลอกลิงก์นี้ไปเปิด:</p>
      <p>${url}</p>
    </div>`
  );
};

export const sendRegisterSuccessEmail = async (to, name = "ผู้ใช้") => {
  // await transporter.verify();
  console.log("SMTP READY");

  const info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject: "สมัครสมาชิกสำเร็จ",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.7;">
        <h2>สมัครสมาชิกสำเร็จ 🎉</h2>
        <p>สวัสดี ${name}</p>
        <p>บัญชีของคุณถูกสร้างเรียบร้อยแล้ว และสามารถเข้าใช้งานได้ทันที</p>
        <p>อีเมลนี้เป็นเพียงการแจ้งเตือนว่าการสมัครสมาชิกสำเร็จ</p>
      </div>
    `,
  });

  console.log("REGISTER MAIL SENT:", info.response);
};

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: "กรุณากรอกชื่อ" });
    if (!email || !password || !confirmPassword)
      return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบ" });
    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน" });

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: true,
      verificationToken: "",
      verifyOTP: "",
      verifyOTPExpire: null,
    });

    const token = createToken(newUser._id);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic || "",
        isVerified: newUser.isVerified,
      },
    });

    // ส่งอีเมลแบบ background
    sendBrevoEmail(
      newUser.email,
      "สมัครสมาชิกสำเร็จ",
      `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>สวัสดี ${newUser.name}</h2>
        <p>บัญชีของคุณถูกสร้างเรียบร้อยแล้ว และสามารถเข้าใช้งานได้ทันที</p>
        <hr />
        <p style="color:#666;font-size:12px;">ขอบคุณที่ใช้งานระบบของเรา</p>
      </div>`
    )
      .then(() => console.log("REGISTER MAIL SENT"))
      .catch((e) => console.log("REGISTER MAIL ERROR:", e.message));

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=missing-token`);

    const user = await userModel.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
    });
    if (!user)
      return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=invalid-or-expired`);

    user.isVerified = true;
    user.verificationToken = "";
    user.verificationTokenExpire = 0;
    await user.save();

    return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=success`);
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/verify-email?status=error&message=server-error`);
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "กรุณาระบุ email" });

    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: "ไม่พบบัญชีผู้ใช้" });
    if (user.isVerified)
      return res.status(400).json({ success: false, message: "บัญชีนี้ยืนยันอีเมลแล้ว" });

    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verifyToken;
    user.verificationTokenExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verifyToken}`;
    await sendEmail(user.email, verifyUrl);

    return res.status(200).json({ success: true, message: "ส่งอีเมลยืนยันใหม่แล้ว" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "กรุณากรอก email และ password" });

    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ success: false, message: "Wrong password" });
    if (!user.isVerified)
      return res.status(403).json({ success: false, message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ" });

    const token = createToken(user._id);
    res.cookie("token", token, COOKIE_OPTIONS);
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", COOKIE_OPTIONS);
    return res.status(200).json({ success: true, message: "Logout success" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลผู้ใช้" });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });

    const { name, bio, profilePic, coverPic } = req.body;
    if (typeof name === "string") user.name = name;
    if (typeof bio === "string") user.bio = bio;
    if (typeof profilePic === "string") user.profilePic = profilePic;
    if (typeof coverPic === "string") user.coverPic = coverPic;
    await user.save();

    return res.json({ success: true, message: "อัปเดตโปรไฟล์สำเร็จ", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "กรุณาระบุอีเมล" });

    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(200).json({ success: true, message: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetOTP = resetToken;
    user.resetOTPExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(user.email, resetUrl);

    return res.status(200).json({ success: true, message: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: "กรุณาระบุ token และรหัสผ่านใหม่" });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" });
    if (!/[A-Z]/.test(newPassword))
      return res.status(400).json({ success: false, message: "รหัสผ่านใหม่ต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว" });

    const user = await userModel.findOne({ resetOTP: token, resetOTPExpire: { $gt: Date.now() } });
    if (!user)
      return res.status(400).json({ success: false, message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = "";
    user.resetOTPExpire = 0;
    await user.save();

    return res.status(200).json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendResetPasswordEmail = async (to, url = "#") => {
  await sendBrevoEmail(
    to,
    "รีเซ็ตรหัสผ่านของคุณ",
    `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>รีเซ็ตรหัสผ่าน</h2>
      <p>กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
      <a href="${url}" style="display:inline-block;padding:10px 16px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;">
        Reset Password
      </a>
      <p style="margin-top:16px;">หากปุ่มไม่ทำงาน ให้คัดลอกลิงก์นี้ไปเปิด:</p>
      <p>${url}</p>
    </div>`
  );
  console.log("RESET MAIL SENT");
};

export const requestAccountChange = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, password } = req.body;

    const user = await userModel.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });

    if (name && name !== user.name) user.name = name;

    const emailChanged = email && email !== user.email;
    const passwordChanged = password && password.trim() !== "";

    if (!emailChanged && !passwordChanged) {
      await user.save();
      return res.json({ success: true, message: "อัปเดตสำเร็จ" });
    }

    if (emailChanged) {
      const exist = await userModel.findOne({ email });
      if (exist && exist._id.toString() !== userId)
        return res.status(400).json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" });
      user.pendingEmail = email;
    }

    if (passwordChanged) {
      if (password.length < 8)
        return res.status(400).json({ success: false, message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" });
      if (!/[A-Z]/.test(password))
        return res.status(400).json({ success: false, message: "รหัสผ่านใหม่ต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว" });
      user.pendingPassword = await bcrypt.hash(password, 10);
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.changeVerifyToken = token;
    user.changeVerifyExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/confirm-change?token=${token}`;
    await sendEmail(user.email, verifyUrl);

    return res.json({ success: true, message: "ส่งอีเมลยืนยันแล้ว", requireVerification: true });
  } catch (err) {
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
    if (!user)
      return res.json({ success: false, message: "ลิงก์หมดอายุ" });

    if (user.pendingEmail) { user.email = user.pendingEmail; user.pendingEmail = ""; user.isVerified = true; }
    if (user.pendingPassword) { user.password = user.pendingPassword; user.pendingPassword = ""; }
    user.changeVerifyToken = "";
    user.changeVerifyExpire = 0;
    await user.save();

    return res.json({ success: true, message: "ยืนยันสำเร็จ" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const sendPasswordChangedEmail = async (to, name = "ผู้ใช้") => {
  await sendBrevoEmail(
    to,
    "มีการเปลี่ยนรหัสผ่านบัญชีของคุณ",
    `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>เปลี่ยนรหัสผ่านสำเร็จ</h2>
      <p>สวัสดี ${name}</p>
      <p>รหัสผ่านบัญชีของคุณถูกเปลี่ยนเรียบร้อยแล้ว</p>
      <p>หากคุณไม่ได้เป็นผู้เปลี่ยน กรุณาเข้าสู่ระบบและเปลี่ยนรหัสผ่านทันที</p>
    </div>`
  );
  console.log("PASSWORD CHANGED MAIL SENT");
};

export const changePasswordDirect = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword)
      return res.status(400).json({ success: false, message: "กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน" });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" });
    if (!/[A-Z]/.test(newPassword))
      return res.status(400).json({ success: false, message: "รหัสผ่านใหม่ต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ success: false, message: "ยืนยันรหัสผ่านไม่ตรงกัน" });

    const user = await userModel.findById(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.pendingPassword = "";
    user.changeVerifyToken = "";
    user.changeVerifyExpire = 0;
    await user.save();

    try { await sendPasswordChangedEmail(user.email, user.name); }
    catch (e) { console.error("PASSWORD CHANGED MAIL ERROR:", e.message); }

    return res.status(200).json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ และส่งอีเมลแจ้งเตือนแล้ว" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## อย่าลืมทำขั้นตอนนี้ก่อน deploy

ไปที่ Render Dashboard → Environment → เพิ่ม:
```
BREVO_API_KEY = xkeysib - xxxxxxxxxxxx