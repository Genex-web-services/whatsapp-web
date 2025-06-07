const getModels = require('../utils/getModels');
const handleError = require('../utils/handleError');

async function checkBilling(req, res, next) {
  try {
    const { Billing } = await getModels();

    const tenantId = req.query.tenant_id || req.headers['x-tenant-id'];
    const productId = req.query.product_id || req.headers['x-product-id'];

    if (!tenantId || !productId) {
      return handleError(res, {
        status: 400,
        message: 'Missing tenant or product information.',
        buttons: [
          { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
          { text: 'Contact Support', href: 'mailto:support@gws365.in', style: 'danger' }
        ]
      });
    }

    const billing = await Billing.findOne({ tenantId, productId }).sort({ currentCycleEnd: -1 });

    if (!billing) {
      return res.redirect('https://pay.gws365.in?reason=no-billing-found');
    }

    const now = new Date();

    if (!billing.currentCycleStart || !billing.currentCycleEnd || now > billing.currentCycleEnd) {
      return res.redirect('https://pay.gws365.in?reason=expired');
    }

    req.billing = billing;
    return next();

  } catch (err) {
    console.error('Billing middleware error:', err);
    return handleError(res, {
      status: 500,
      message: 'Something went wrong during the billing check.',
      error: err.message,
      buttons: [
        { text: 'Retry', href: 'javascript:location.reload()', style: 'secondary' },
        { text: 'Go to Dashboard', href: '/dashboard', style: 'primary' },
        { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
      ]
    });
  }
}

module.exports = checkBilling;
