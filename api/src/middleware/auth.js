import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod_123!';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn });
}

export function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/Bearer\s+(.*)$/i);
  if (!m) return res.status(401).json({ success: false, error: 'Missing token' });
  const token = m[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = decoded; // contains sub, email, role, name
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
