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