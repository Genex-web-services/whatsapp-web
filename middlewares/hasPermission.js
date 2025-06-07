const getModels = require('../utils/getModels');
const handleError = require('../utils/handleError');

function hasPermission(requiredPid) {
  return async (req, res, next) => {
    try {
      const { User, Role, Tenant, Product } = await getModels();
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.redirect('/login');
      }

      // Skip product URL check for local environment
      if (
        process.env.NODE_ENV === 'production' &&
        req.hostname !== 'localhost' &&
        req.hostname !== '127.0.0.1'
      ) {
        const fullUrl = `https://${req.get('host')}`;
        console.log('Checking product URL access:', fullUrl);

        const product = await Product.findOne({ product_url: fullUrl });
        if (!product) {
          return handleError(res, {
            status: 403,
            message: 'Access denied: Invalid product URL.',
            buttons: [
              { text: 'Go Home', href: '/', style: 'primary' },
              { text: 'Contact Support', href: 'mailto:support@gws365.in', style: 'danger' }
            ]
          });
        }

        const productCode = product.product_code;
        const tenant = await Tenant.findById(user.tenantId);

        if (!tenant) {
          return handleError(res, {
            status: 403,
            message: 'Access denied: Tenant not found.',
            buttons: [
              { text: 'Back to Login', href: '/login', style: 'primary' },
              { text: 'Contact Support', href: 'mailto:support@gws365.in', style: 'danger' }
            ]
          });
        }

        if (!tenant.productAccess.includes(productCode)) {
          return handleError(res, {
            status: 403,
            message: `Access denied: Your tenant doesn't have access to "${productCode}".`,
            buttons: [
              { text: 'Back to Dashboard', href: '/dashboard', style: 'primary' },
              { text: 'Request Access', href: 'mailto:support@gws365.in', style: 'success' }
            ]
          });
        }
      } else {
        console.log('Product URL check skipped (non-production or localhost)');
      }

      const role = await Role.findOne({ roleCode: user.roleId });

      if (role && Array.isArray(role.permissions) && role.permissions.includes('*')) {
        return next();
      }

      if (!role || !role.permissions.includes(requiredPid)) {
        return handleError(res, {
          status: 403,
          message: `Access Denied: You do not have permission to access "${requiredPid}".`,
          buttons: [
            { text: 'Back to Dashboard', href: '/dashboard', style: 'primary' },
            { text: 'Request Permission', href: 'mailto:support@gws365.in', style: 'danger' }
          ]
        });
      }

      next();
    } catch (error) {
      console.error('Permission Middleware Error:', error);
      return handleError(res, {
        status: 500,
        message: 'Internal Server Error while checking permissions.',
        error: error.message,
        buttons: [
          { text: 'Reload', href: 'javascript:location.reload()', style: 'secondary' },
          { text: 'Contact Support', href: 'mailto:support@gws365.in', style: 'danger' }
        ]
      });
    }
  };
}

module.exports = hasPermission;
