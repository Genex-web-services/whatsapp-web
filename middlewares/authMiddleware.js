const jwt = require('jsonwebtoken');
const axios = require('axios');
const handleError = require('../utils/handleError');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.gwsToken;

  if (!token) {
    console.log('No token provided');
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const apiURL = `${process.env.Login_URL}/getuserById/${userId}`;
    const response = await axios.get(apiURL);

    if (response.data && response.data.user) {
      const user = response.data.user;
      req.user = user;

      const currentHost = req.get('host');

      // Partner portal access check
      if (
        currentHost === 'partner.gws365.in' ||
        currentHost === 'localhost:3004'
      ) {
        if (user.is_user_partner === 'true') {
          return next();
        } else {
          console.warn('User is not a partner, access denied.');
          return handleError(res, {
            status: 403,
            message: 'Access Denied: You are not authorized to view this page.',
            buttons: [
              { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
              { text: 'Become a Partner', href: '/partner/register', style: 'success' }
            ]
          });
        }
      }

      // Auth success for other domains
      return next();
    } else {
      console.warn('No user data returned from getuserById. Reloading page.');
      return res.redirect(req.originalUrl);
    }

  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    return handleError(res, {
      status: 401,
      message: 'Unauthorized access. Invalid or expired token.',
      error: err.message,
      buttons: [
        { text: 'Login Again', href: '/login', style: 'primary' },
        { text: 'Go Home', href: '/', style: 'secondary' },
        { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
      ]
    });
  }
};

module.exports = authMiddleware;
