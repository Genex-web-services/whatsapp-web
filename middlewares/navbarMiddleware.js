const jwt = require('jsonwebtoken');
const axios = require('axios');
const handleError = require('../utils/handleError');

const navbarMiddleware = async (req, res, next) => {
  const token = req.cookies.gwsToken;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.redirect('/login');
    }

    // Fetch user info
    const userRes = await axios.get(`${process.env.Login_URL}/getuserById/${userId}`);
    if (!userRes.data || !userRes.data.user) {
      return handleError(res, {
        status: 401,
        message: 'User information could not be retrieved. Please login again.',
        buttons: [
          { text: 'Login', href: '/login', style: 'primary' },
        ]
      });
      // return res.status(401).json({ message: 'User information could not be retrieved. Please login again.' });
    }
    req.user = userRes.data.user;

    // Fetch products for navbar
    const productsRes = await axios.get(`${process.env.Login_URL}/api/v1.0/client/`);
    req.products = productsRes.data || [];

    // Fetch notifications (optional - uncomment if needed)
    // const notifRes = await axios.get(`https://api.gws365.in/api/v1.0/notifications`);
    // req.notifications = notifRes.data.notifications || [];

    next();
  } catch (err) {
    console.error('Navbar Middleware Error:', err);
    return handleError(res, {
      status: 401,
      message: 'Invalid or expired token.',
      error: err.message,
      buttons: [
        { text: 'Login', href: '/login', style: 'primary' },
      ]
    });
    // return res.status(401).json({ message: 'Invalid or expired token.', error: err.message });
  }
};

module.exports = navbarMiddleware;
