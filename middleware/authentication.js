export default function authenticateToken(req, res, next) {
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res.status(401).json({ 
      message: "No token provided",
      error: "AUTH_TOKEN_MISSING"
    });
  }

  const token = authHeader.split(" ")[1]; // Expecting "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ 
      message: "Invalid token format",
      error: "AUTH_TOKEN_INVALID_FORMAT"
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    if (verified.exp && verified.exp < Date.now() / 1000) {
      return res.status(401).json({ 
        message: "Token has expired",
        error: "AUTH_TOKEN_EXPIRED"
      });
    }

    req.user = verified; // Attach user data to request
    next(); // Continue to the next middleware or route
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token has expired",
        error: "AUTH_TOKEN_EXPIRED"
      });
    }
    
    return res.status(401).json({ 
      message: "Invalid token",
      error: "AUTH_TOKEN_INVALID"
    });
  }
}
