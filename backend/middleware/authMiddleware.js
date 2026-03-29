import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // อ่านจาก Authorization header ก่อน แล้วค่อย fallback ไป cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token failed" });
  }
};

export default authMiddleware;