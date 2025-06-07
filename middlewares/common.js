const handleError = require('../utils/handleError');

// Middleware to redirect user if already logged in
const redirectIfLoggedIn = (req, res, next) => {
  const { gwsToken } = req.cookies;
  if (gwsToken) {
    return res.redirect('/dashboard');
  }
  next();
};

// Unified rendering helper with safe defaults
const renderWithLocals = (res, view, req, extra = {}) => {
  try {
    return res.render(view, {
      user: req.user || null,
      products: req.products || [],
      notifications: req.notifications || [],
      ...extra,
    });
  } catch (err) {
    console.error('renderWithLocals error:', err);
    return handleError(res, {
      status: 500,
      message: 'Failed to render the page. Something went wrong on our side.',
      error: err.message,
      buttons: [
        { text: 'Back to Dashboard', href: '/dashboard', style: 'primary' },
        { text: 'Reload', href: 'javascript:location.reload()', style: 'secondary' },
        { text: 'Contact Support', href: 'mailto:support@gws365.in', style: 'danger' }
      ]
    });
  }
};

module.exports = {
  redirectIfLoggedIn,
  renderWithLocals,
};
