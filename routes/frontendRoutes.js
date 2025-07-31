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
    return res.redirect('/projects');
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
    return res.redirect('/projects');
  }

  const queryParams = req.query;
  res.render('authentication/signin.ejs', {
    queryParams,
    user: req.user || null,
    products: req.products || [], 
notifications: req.notification || [],
  });
});



// OAuth Callback
router.get('/auth/callback',accessScope(), (req, res) => {
  const { gwsToken } = req.cookies;

  if (gwsToken) {
    return res.redirect('/projects');
  } else {
    return res.redirect('/login');
  }
});

// Define function
const getQueryParams = (req) => req.query;
// ---------------- Product ----------------
router.get('/projects', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('projects/index.ejs', { queryParams: getQueryParams(req),user: req.user || null,
    products: req.products || [], 
notifications: req.notification || [], });
});

// Dashboard Page
router.get('/dashboard/:id/index', authMiddleware, navbarMiddleware, accessScope(), async (req, res) => {
  try {
    const products = (req.products || []).filter(
      p => p.product_code !== 'genexpay' && p.product_code !== 'apicenter' && p.product_code !== 'admincenter'&& p.product_code !== 'partnerportal'
    );

    res.render('dashboard/index', { 
      user: req.user,
      products: products,
      notifications: req.notification || [],
      stats: {
          sent_messages: 1289,
          active_sessions: 3,
          pending_messages: 42,
          connection_status: 'Connected' // or 'QR Pending', 'Disconnected', etc.
        }
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

// ---------------- Session / QR ----------------
router.get('/dashboard/:id/qr-scan', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('dashboard/qr-scan.ejs', {
    queryParams: getQueryParams(req),
    user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [],
  });
});

// ---------------- Manual Sender ----------------
router.get('/dashboard/:id/send-message', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('messages/send-message.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

// ---------------- Bulk Sender ----------------
router.get('/dashboard/:id/bulk-sender', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('messages/bulk-sender.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

// ---------------- Scheduled Messages ----------------
router.get('/dashboard/:id/scheduled-messages', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('messages/scheduled-messages.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

// ---------------- Auto Replies ----------------
router.get('/dashboard/:id/auto-reply', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('automation/auto-reply.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

// ---------------- Templates ----------------
router.get('/dashboard/:id/templates', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('templates/index.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

// ---------------- Contacts ----------------
router.get('/dashboard/:id/contacts', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  const userId = req.params.id;

  res.render('contacts/index.ejs', {
    queryParams: getQueryParams(req),
    user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [],
    userId, // 👈 pass the ID here
  });
});


// ---------------- Logs ----------------
router.get('/dashboard/:id/message-logs', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('logs/message-logs.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

router.get('/dashboard/:id/activity-logs', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('logs/activity-logs.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});



router.get('/dashboard/:id/api', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('api/api.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

// ---------------- Settings ----------------
router.get('/dashboard/:id/settings/general', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('settings/general.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

router.get('/dashboard/:id/settings/notification', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('settings/notification.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

router.get('/dashboard/:id/settings/api', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('settings/api.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

router.get('/dashboard/:id/settings/theme', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('settings/theme.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

// ---------------- Users ----------------
router.get('/dashboard/:id/users/list', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('users/list.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});

router.get('/dashboard/:id/users/add', authMiddleware, navbarMiddleware, accessScope(), (req, res) => {
  res.render('users/add.ejs', { queryParams: getQueryParams(req), user: req.user || null,
    products: req.products || [],
    notifications: req.notification || [], });
});


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
