const getModels = require('../utils/getModels');

async function checkBilling(req, res, next) {
  try {
     const { Billing, Invoices, Wallet, Product, Tenant } = await getModels();
    const tenantId = req.query.tenant_id || req.headers['x-tenant-id'];
    const productId = req.query.product_id || req.headers['x-product-id'];

    if (!tenantId || !productId) {
      return res.status(400).send('Missing tenant_id or product_id');
    }

    const billing = await Billing.findOne({
      tenantId,
      productId
    }).sort({ currentCycleEnd: -1 }); // Get the latest billing entry

    if (!billing) {
      return res.redirect('https://pay.gws365.in?reason=no-billing-found');
    }

    const now = new Date();

    if (!billing.currentCycleStart || !billing.currentCycleEnd || now > billing.currentCycleEnd) {
      return res.redirect('https://pay.gws365.in?reason=expired');
    }

    // Optional: attach billing info to request
    req.billing = billing;

    next();
  } catch (err) {
    console.error('Billing middleware error:', err);
    res.status(500).send('Billing check failed');
  }
};
module.exports = checkBilling