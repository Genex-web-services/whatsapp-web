// middlewares/common.js

// Middleware to redirect if gwsToken cookie is present
const redirectIfLoggedIn = (req, res, next) => {
  const { gwsToken } = req.cookies;
  if (gwsToken) {
    return res.redirect('/dashboard');
  }
  next();
};

// Helper function to render with common locals
const renderWithLocals = (res, view, req, extra = {}) => {
  return res.render(view, {
    user: req.user,
    products: req.products || [],
    notifications: req.notification || [],
    ...extra,
  });
};

module.exports = {
  redirectIfLoggedIn,
  renderWithLocals,
};
