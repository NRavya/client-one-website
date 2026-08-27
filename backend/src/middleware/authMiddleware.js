const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'NOT_AUTHORIZED', message: 'Not authorized, no token' } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, customerId, role }
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: { code: 'NOT_AUTHORIZED', message: 'Not authorized, token failed' } });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
    next();
  } else {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized as an admin' } });
  }
};

module.exports = { protect, admin };
