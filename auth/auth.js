import jwt from "jsonwebtoken";

function verifyJWT(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Access denied, No Token Provided",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Access denied, No Token Provided",
        error: error.message,
      });
    }

    req.user = user;
    next();
  });
}

export default verifyJWT;
