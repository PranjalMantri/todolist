import jwt from "jsonwebtoken";

function verifyJWT(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Access denied, No Token Provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    console.log("Setting the userId");
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
}

export default verifyJWT;
