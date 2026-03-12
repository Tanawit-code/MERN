import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {
<<<<<<< HEAD
    return res.status(401).json({
      success: false,
      message: "Not authorized"
    });
=======
    return res.status(401).json({ message: "Not authorized" });
>>>>>>> 8dcc28b3ab0fc7214123df53abac46840d33b729
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

<<<<<<< HEAD
    req.userId = decoded.id;   // ใช้ userId จะสะดวกกว่า
=======
    req.user = decoded;
>>>>>>> 8dcc28b3ab0fc7214123df53abac46840d33b729

    next();

  } catch (error) {
<<<<<<< HEAD

    return res.status(401).json({
      success: false,
      message: "Token failed"
    });

  }
};

export default authMiddleware;
=======
    res.status(401).json({ message: "Token failed" });
  }
};
export default authMiddleware;
>>>>>>> 8dcc28b3ab0fc7214123df53abac46840d33b729
