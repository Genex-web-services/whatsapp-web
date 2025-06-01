const jwt = require('jsonwebtoken');
const axios = require('axios'); // for internal API call

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.gwsToken;

  if (!token) {

    console.log('No token provided'); 
    return res.redirect('/login'); // Redirect to login if no token
    
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log('Decoded User ID:', userId);
    // Call your own internal API to get full user details
    const apiURL = `https://auth.genexwebservices.com/getuserById/${userId}`;
    const response = await axios.get(apiURL); // You can also include auth headers if needed

    if (response.data && response.data.user) {
      req.user = response.data.user; // attach full user to request
      next();
    } else {
      // return res.status(401).json({ message: 'User not found' });
      return res.redirect('/login'); // Redirect to login if user not found
    }
    
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(401).json({ message: 'Invalid token'.err });
  }
};

module.exports = authMiddleware;


