
// ตรวจสอบว่า request ล็อกอินอยู่หรือไม่
// หลักการคืออ่าน token จาก req.cookies.token แล้ว jwt.verify(...) ถ้าผ่านจะใส่ req.userId ไว้ให้ controller ใช้งานต่อ ถ้าไม่ผ่านจะตอบ 401

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized"
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;   // ใช้ userId จะสะดวกกว่า

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Token failed"
    });

  }
};

export default authMiddleware;
