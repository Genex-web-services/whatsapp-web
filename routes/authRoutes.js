const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, client_id, redirect_uri, state } = req.body;

  try {
    // Validate client only if both client_id and redirect_uri are provided
    if (client_id && redirect_uri) {
      const client = await Client.findOne({ client_id });
      if (!client || client.redirect_uri !== redirect_uri) {
        return res.status(400).json({ message: 'Invalid client or redirect URI' });
      }
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists, kindly login' });
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = generateToken(user);

    // Redirect if redirect_uri exists, else send JSON response
    if (redirect_uri) {
      return res.redirect(`${redirect_uri}?token=${token}${state ? `&state=${state}` : ''}`);
    } else {
      return res.json({ success: true, token, user: { name, email } });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
// Generate JWT
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Login Route
router.post('/login', async (req, res) => {
  const { email, password, client_id, redirect_uri, state } = req.body;

  try {
    // Validate user existence & password
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = createToken(user);

    // Cookie options
    let cookieOptions = {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions = {
        ...cookieOptions,
        secure: true,
        sameSite: 'None',
        domain: '.genexwebservices.com'
      };
    } else {
      cookieOptions = {
        ...cookieOptions,
        secure: false,
        sameSite: 'Lax'
      };
    }

    // Set HttpOnly cookie with token
    res.cookie('gwsToken', token, cookieOptions);

    // Send response JSON (token also sent in JSON body if needed)
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: { email: user.email, name: user.name },
      token, // optional, since cookie is sent
      client_id,
      redirect_uri,
      state
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/v1.0/getuserById/:id
router.get('/getuserById/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/logout', (req, res) => {
  res.cookie('gwsToken', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    domain: process.env.NODE_ENV === 'production' ? '.genexwebservices.com' : undefined
  });

  const redirectURL = req.query.redirect_uri ?? '/login';

  if (redirectURL) {
    return res.redirect(redirectURL);
  } else {
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
});


module.exports = router;
