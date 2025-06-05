const jwt = require('jsonwebtoken');
const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.gwsToken;

  if (!token) {
    console.log('No token provided');
    return res.redirect('/login');
  } 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const apiURL = process.env.Login_URL + `/getuserById/${userId}`;
    const response = await axios.get(apiURL);

    if (response.data && response.data.user) {
      req.user = response.data.user;
      next();
    } else {
      console.warn('Empty response from getuserById API. Refreshing page.');
      return res.redirect(req.originalUrl); // Refresh current page
    }

  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

module.exports = authMiddleware;
