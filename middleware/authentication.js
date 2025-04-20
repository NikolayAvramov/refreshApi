export default function authenticateToken(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; // Expecting "Bearer TOKEN"

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user data to request
    next(); // Continue to the next middleware or route
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}
