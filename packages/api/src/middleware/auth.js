const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Get token from Authorization header: "Bearer TOKEN"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
    req.user = decoded; // { userId, customerId, role }
    
    console.log(`🔐 Authenticated: ${decoded.role} from ${decoded.customerId}`);
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticateToken;