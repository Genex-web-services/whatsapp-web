module.exports = function handleError(res, {
  status = 500,
  message = 'Something went wrong.',
  type = 'html', // can be 'html', 'json', or 'text'
  buttons = [
    { text: 'Back to Dashboard', href: '/dashboard', style: 'primary' },
    { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
    { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' },
    { text: 'Become a Partner', href: '/partner/register', style: 'success' },
  ],
  error = null
}) {
  if (type === 'json') {
    return res.status(status).json({ error: message, details: error || null });
  } else if (type === 'text') {
    return res.status(status).send(message);
  } else {
    return res.status(status).render('error/error', {
      status,
      message,
      buttons,
      error,
      user: [],
      products: [],
      notifications: []
    });
  }
};
