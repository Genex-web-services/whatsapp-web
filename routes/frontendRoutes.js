const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const authMiddleware = require('../middlewares/authMiddleware');
const navbarMiddleware = require('../middlewares/navbarMiddleware');

// Redirect root URL to /login
router.get('/', (req, res) => {
  res.redirect('/login');
});

// Login Page
router.get('/login', (req, res) => {
  const { gwsToken } = req.cookies;

  if (gwsToken) {
    return res.redirect('/dashboard');
  }

  const queryParams = req.query;
  res.render('authentication/signin.ejs', {
    queryParams,
    user: req.user || null,
    products: req.products || [],
notifications: req.notification || [],
  });
});

// Dashboard Page
router.get('/dashboard', authMiddleware, navbarMiddleware, async (req, res) => {
  try {
    const products = await Client.find();
    res.render('dashboard/index', {
      products,
      user: req.user,
      products: req.products || [],
notifications: req.notification || [],
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).send('Server Error');
  }
});

// OAuth Callback
router.get('/auth/callback', (req, res) => {
  const { gwsToken } = req.cookies;

  if (gwsToken) {
    return res.redirect('/dashboard');
  } else {
    return res.redirect('/login');
  }
});

module.exports = router;
