const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const navbarMiddleware = require('../middlewares/navbarMiddleware');
const hasPermission = require('../middlewares/hasPermission');
const accessScope = require('../middlewares/accessScope'); // ensure this is imported
const getModels = require('../utils/getModels');
const handleError = require('../utils/handleError');
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
router.get('/login', async (req, res) => {
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
router.get('/dashboard', authMiddleware, navbarMiddleware, accessScope(), async (req, res) => {
  try {
    const products = (req.products || []).filter(
      p => p.product_code !== 'genexpay' && p.product_code !== 'apicenter' && p.product_code !== 'admincenter'&& p.product_code !== 'partnerportal'
    );

    res.render('dashboard/index', { 
      user: req.user,
      products: products,
      notifications: req.notification || [],
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    return handleError(res, {
        status: 500,
        message: 'Server Error. Please try again later.',
        type: 'text', // or 'html' or 'json' depending on context
        error: null,
        buttons: [
          { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
          { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
        ]
      });
  }
});


// OAuth Callback
router.get('/auth/callback',accessScope(), (req, res) => {
  const { gwsToken } = req.cookies;

  if (gwsToken) {
    return res.redirect('/dashboard');
  } else {
    return res.redirect('/login');
  }
});

// Tenants
router.get('/tenants/list',authMiddleware,navbarMiddleware,hasPermission('list_tenant'),accessScope(),async (req, res) => {
  const { Tenant} = await getModels();  
  try {
    console.log('Fetching tenants with filter:', req.filter);
      const tenants = await Tenant.find(req.filter);
      renderWithLocals(res, 'tenants/list', req, {
        tenants
      });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return handleError(res, {
  status: 500,
  message: 'Server Error. Please try again later.',
  type: 'text', // or 'html' or 'json' depending on context
  error: null,
  buttons: [
    { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
    { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
  ]
});
    }
  }
);

router.get('/tenants/edit/:id',authMiddleware,navbarMiddleware,hasPermission('edit_tenant'),accessScope(),async(req, res) => {
  const { Tenant} = await getModels();
    renderWithLocals(res, 'tenants/add', req,{
         Tenant:Tenant.find({}),
      });
  }
);

// Organisations
router.get('/organisation/list', authMiddleware, navbarMiddleware,hasPermission('list_organisation'),accessScope(), async (req, res) => {  
  const { Organization} = await getModels();
  try {
    const organizations = await Organization.find(req.filter);
    renderWithLocals(res, 'organisation/list', req, { organizations });
  } catch (err) {
    console.error(err);
   return handleError(res, {
  status: 500,
  message: 'Server Error. Please try again later.',
  type: 'text', // or 'html' or 'json' depending on context
  error: null,
  buttons: [
    { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
    { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
  ]
});
  }
});


// Logs
router.get('/logs',authMiddleware,navbarMiddleware,accessScope(),hasPermission('logs'),async (req, res) => {
  const { Log } = await getModels();
    try {
      const logs = await Log.find({email:req.user.email}).sort({ createdAt: -1 }); // Optionally sort by date
      renderWithLocals(res, 'logs/logs', req, { logs });
    } catch (err) {
      console.error('Error fetching logs:', err);
      return handleError(res, {
  status: 500,
  message: 'Server Error. Please try again later.',
  type: 'text', // or 'html' or 'json' depending on context
  error: null,
  buttons: [
    { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
    { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
  ]
});
    }
  }
);

// Settings
router.get(
  '/settings/company',
  authMiddleware,
  navbarMiddleware,accessScope(),
  (req, res) => {
    renderWithLocals(res, 'settings/company', req);
  }
);
router.get(
  '/settings/notification',
  authMiddleware,
  navbarMiddleware,accessScope(),
  (req, res) => {
    renderWithLocals(res, 'settings/notification', req);
  }
);
router.get(
  '/settings/notificationAlert',
  authMiddleware,
  navbarMiddleware,accessScope(),
  (req, res) => {
    renderWithLocals(res, 'settings/notificationAlert', req);
  }
);
router.get(
  '/settings/theme',
  authMiddleware,
  navbarMiddleware,accessScope(),
  (req, res) => {
    renderWithLocals(res, 'settings/theme', req);
  }
);
router.get(
  '/settings/currencies',
  authMiddleware,
  navbarMiddleware,accessScope(),
  (req, res) => {
    renderWithLocals(res, 'settings/currencies', req);
  }
);
router.get(
  '/settings/language',
  authMiddleware,
  navbarMiddleware,accessScope(),
  (req, res) => {
    renderWithLocals(res, 'settings/language', req);
  }
);
router.get(
  '/settings/paymentGateway',
  authMiddleware,
  navbarMiddleware,accessScope(),
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
