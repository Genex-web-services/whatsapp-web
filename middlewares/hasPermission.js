const getModels = require('../utils/getModels');
const url = require('url');

function hasPermission(requiredPid) {
  return async (req, res, next) => {
    try {
      const { User, Role ,Tenant,Product } = await getModels(); // await here, inside middleware

      const user = await User.findById(req.user._id);

      if (!user) return res.redirect('/login');

    if(process.env.NODE_ENV && process.env.NODE_ENV === 'production'&& req.hostname !== 'localhost' &&   req.hostname !== '127.0.0.1') {
      console.log('Checking product URL access in production environment');
      // Extract base URL from original request
      const fullUrl = `https://${req.get('host')}`; // e.g., https://pay.gws365.in
      // console.log('Base URL:', fullUrl);

      // Find product using base URL
      const product = await Product.findOne({ product_url: fullUrl });
      if (!product) {
        console.log('Product not found for URL:', fullUrl);
        return res.redirect('/denied');
      }

      const productCode = product.product_code;
      // console.log('Product code:', productCode);

      // Get tenant and check access
      const tenant = await Tenant.findById(user.tenantId);
      if (!tenant) {
        console.log('Tenant not found');
        return res.redirect('/denied');
      }

      if (!tenant.productAccess.includes(productCode)) {
        console.log(`Tenant does not have access to product ${productCode}`);
        return res.redirect('/denied');
      }
      //  console.log(`Tenant have access to product ${productCode}`);
    }else{
      console.log('Product Url check skipped in local environment');
    }

      const role = await Role.findOne({ roleCode: user.roleId }); // Adjust if needed
      // console.log('Role fetched:', role);

      if (role && Array.isArray(role.permissions) && role.permissions.includes("*")) {
        return next();
      }

      if (!role || !role.permissions.includes(requiredPid)) {
        console.log(`Permission "${requiredPid}" not found`, role?.permissions);
        return res.redirect('/denied');
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        message: 'Internal server error while checking permissions',
        error: error.message
      });
    }
  };
}

module.exports = hasPermission;
