const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Tenant = require('../models/Tenant');
const Organization = require('../models/Organization');
const Roles = require('../models/Role');
const Logs = require('../models/Log');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const navbarMiddleware = require('../middlewares/navbarMiddleware');
const hasPermission = require('../middlewares/hasPermission');

// Middleware to redirect if gwsToken cookie is present
const redirectIfLoggedIn = (req, res, next) => {
  const { gwsToken } = req.cookies;
  if (gwsToken) {
    return res.redirect('/dashboard');
  }
  next();
};

// Helper function to render with common locals
function renderWithLocals(res, view, req, extra = {}) {
  return res.render(view, {
    user: req.user,
    products: req.products || [],
    notifications: req.notification || [],
    ...extra,
  });
}

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
    res.render('dashboard/index', { 
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


// Admin/User List
router.get('/roles-and-permission/list',authMiddleware,navbarMiddleware,hasPermission('list_role'), async (req, res) => {
    try {
      const roles = await Roles.find({});
      renderWithLocals(res, 'role/list', req, { roles });
    } catch (err) {
      console.error('Error fetching roles:', err);
      res.status(500).send('Internal Server Error');
    }
  }
);

router.get('/roles-and-permission/add',authMiddleware,navbarMiddleware,hasPermission('add_role'),async (req, res) => {
    try {
      const roles = await Roles.find({});
      renderWithLocals(res, 'role/add', req, { roles });
    } catch (err) {
      console.error('Error fetching roles:', err);
      res.status(500).send('Internal Server Error');
    }
  }
);
router.get('/users/list', authMiddleware, navbarMiddleware,hasPermission('list_user'), async (req, res) => {
    try {
        const users = await User.find({}); // Fetch all users
        renderWithLocals(res, 'users/list', req, { users });
    } catch (error) {
        console.error("Error fetching users: ", error);
        res.status(500).send('Error fetching users');
    }
});
router.get('/users/add',authMiddleware,navbarMiddleware,hasPermission('add_user'),(req, res) => {
    renderWithLocals(res, 'users/add', req,{
        User:User.find({}),
      });
  }
);



// Tenants
router.get('/tenants/list',authMiddleware,navbarMiddleware,hasPermission('list_tenant'),async (req, res) => {
    try {
      const tenants = await Tenant.find({});
      renderWithLocals(res, 'tenants/list', req, {
        tenants
      });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).send('Internal Server Error');
    }
  }
);

router.get('/tenants/add',authMiddleware,navbarMiddleware,hasPermission('add_tenant'),(req, res) => {
    renderWithLocals(res, 'tenants/add', req,{
         Tenant:Tenant.find({}),
      });
  }
);

// Organisations
router.get('/organisation/list', authMiddleware, navbarMiddleware,hasPermission('list_organisation'), async (req, res) => {  
  try {
    const organizations = await Organization.find({});
    renderWithLocals(res, 'organisation/list', req, { organizations });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/organisation/add',authMiddleware,hasPermission('add_organisation'),navbarMiddleware,(req, res) => {
    renderWithLocals(res, 'organisation/add', req,{
         Organization:Organization.find({}),
      });
  }
);

// Products
router.get('/products/list',  authMiddleware,  navbarMiddleware,hasPermission('list_product'),(req, res) => {
    renderWithLocals(res, 'products/list', req,{ Product:Product.find({}),});
  }
);
router.get('/products/add',authMiddleware,navbarMiddleware,hasPermission('add_product'),(req, res) => {
    renderWithLocals(res, 'products/add', req,{
         Product:Product.find({}),
      });
  }
);
router.get(
  '/products/pricing',
  authMiddleware,
  navbarMiddleware,
  (req, res) => {
    renderWithLocals(res, 'products/pricing', req,{
         Product:Product.find({}),
      });
  }
);

// Logs
router.get('/logs',authMiddleware,navbarMiddleware,hasPermission('logs'),async (req, res) => {
    try {
      const logs = await Logs.find({}).sort({ createdAt: -1 }); // Optionally sort by date
      renderWithLocals(res, 'logs/logs', req, { logs });
    } catch (err) {
      console.error('Error fetching logs:', err);
      res.status(500).send('Internal Server Error');
    }
  }
);

// Settings
router.get(
  '/settings/company',
  authMiddleware,
  navbarMiddleware,
  (req, res) => {
    renderWithLocals(res, 'settings/company', req);
  }
);
router.get(
  '/settings/notification',
  authMiddleware,
  navbarMiddleware,
  (req, res) => {
    renderWithLocals(res, 'settings/notification', req);
  }
);
router.get(
  '/settings/notificationAlert',
  authMiddleware,
  navbarMiddleware,
  (req, res) => {
    renderWithLocals(res, 'settings/notificationAlert', req);
  }
);
router.get(
  '/settings/theme',
  authMiddleware,
  navbarMiddleware,
  (req, res) => {
    renderWithLocals(res, 'settings/theme', req);
  }
);
router.get(
  '/settings/currencies',
  authMiddleware,
  navbarMiddleware,
  (req, res) => {
    renderWithLocals(res, 'settings/currencies', req);
  }
);
router.get(
  '/settings/language',
  authMiddleware,
  navbarMiddleware,
  (req, res) => {
    renderWithLocals(res, 'settings/language', req);
  }
);
router.get(
  '/settings/paymentGateway',
  authMiddleware,
  navbarMiddleware,
  (req, res) => {
    renderWithLocals(res, 'settings/paymentGateway', req);
  }
);

// Example of login or public route that uses redirect if already logged in
router.get(
  '/login',
  redirectIfLoggedIn,
  (req, res) => {
    res.render('login'); // no user/products/notifications since no auth
  }
);


router.get(
  '/denied',authMiddleware,navbarMiddleware,
  (req, res) => {
    res.render('error/denied',{user: req.user,
    products: req.products || [],
    notifications: req.notification || []}); // no user/products/notifications since no auth
  }
);


module.exports = router;
