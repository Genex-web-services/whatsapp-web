// File: routes/frontendRoutes.js

const express = require('express');
const router = express.Router();
const Client = require('../models/Client'); // or Product model if exists
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware
const User = require('../models/User');
router.get('/getuserById/:id', async (req, res) => {
  const userId = req.params.id;
  console.log("User ID:", userId);

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


// Redirect root URL to /login
router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
  console.log('Cookies:', req.cookies.gwsToken);
  const { gwsToken } = req.cookies;

  if (gwsToken) {
    console.log('Token found:', gwsToken);
    return res.redirect('/dashboard');
  } else {
    console.log('No token found, rendering login');
  }

  const queryParams = req.query;
  res.render('authentication/signin.ejs', { queryParams });
});


router.get('/products',authMiddleware,  async (req, res) => {
  try {
    // Replace this with actual model like Product.find() if using a Product schema
    const products = await Client.find(); 

    res.render('products/index', { products,user:req.user }); // send data to template
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get('/dashboard',authMiddleware,  async (req, res) => {
  try {
    // Replace this with actual model like Product.find() if using a Product schema
    const products = await Client.find(); 

    res.render('dashboard/index', { products,user:req.user }); // send data to template
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// GET route for login page


// GET route for register page
router.get('/register', (req, res) => {
      const queryParams = req.query; // Get all query params from URL
    res.render('authentication/signup.ejs', { queryParams });
});

router.get('/dashboard', (req, res)=>{
    res.render('dashboard/index2', {title:"Dashboard", subTitle:"CRM",script:`<script src="/js/homeTwoChart.js"></script>`})
});

router.get('/auth/callback',authMiddleware,  async (req, res) => {
  console.log('Cookies:', req.cookies.gwsToken);
  const { gwsToken } = req.cookies;

    if (gwsToken) {
      console.log('Token found:', gwsToken);
      return res.redirect('/dashboard');
    } else {
      console.log('No token found, rendering login');
      return res.redirect('/login');
    }
  });
module.exports = router;
