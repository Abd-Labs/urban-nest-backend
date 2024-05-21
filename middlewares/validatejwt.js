const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwtToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Login Again" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Unauthorized: Login again" });
      }
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.user = decoded._id;
    next();
  });
};

module.exports = authenticateToken;
