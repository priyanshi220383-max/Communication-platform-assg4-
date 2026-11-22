const jwt = require('jsonwebtoken');

function getToken(req) {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) return h.split(' ')[1];

  const cookie = req.headers.cookie;
  if (cookie) {
    const t = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
    if (t) return t.slice('token='.length);
  }
  return null;
}

// Protected route check
exports.authenticate = (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(403).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, username, role }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role-based access control
exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: 'Access denied: insufficient role' });