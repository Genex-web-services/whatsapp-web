const jwt = require('jsonwebtoken');
const axios = require('axios');

const navbarMiddleware = async (req, res, next) => {
  const token = req.cookies.gwsToken;

  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    if (userId) {
        // Attach user info to requestx
      const messagesRes = await axios.get(`https://auth.gws365.in/api/v1.0/client/`);
      req.products = messagesRes.data || []; // attach messages

       // Get notifications
    //const notifRes = await axios.get(`https://auth.gws365.in/api/v1.0/notification/${userId}`);
    //req.notifications = notifRes.data.notifications || [];

      next();
    } else {
      return res.redirect('/login');
    }

  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = navbarMiddleware;
