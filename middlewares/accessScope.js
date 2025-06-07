const getModels = require('../utils/getModels');
const handleError = require('../utils/handleError');

const accessScope = () => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return handleError(res, {
          status: 401,
          message: 'Unauthorized: User not found',
          buttons: [
            { text: 'Login Again', href: '/login', style: 'primary' },
            { text: 'Go Home', href: '/', style: 'secondary' }
          ]
        });
      }

      const { Role } = await getModels();
      const roleCode = typeof user.roleId === 'object' && user.roleId.toString ? user.roleId.toString() : user.roleId;
      const roles = await Role.findOne({ roleCode }).lean();

      if (!roles) {
        return handleError(res, {
          status: 403,
          message: 'Forbidden: Role not found',
          buttons: [
            { text: 'Back to Dashboard', href: '/dashboard', style: 'primary' },
            { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
          ]
        });
      }

      const level = roles.level;
      req.scopeLevel = level;

      const url = req.originalUrl;

      // Scope filter logic
      if (url.includes('/tenants')) {
        switch (level) {
          case 0:
            req.filter = {};
            break;
          case 1:
            req.filter = { _id: { $in: user.assignedTenantIds || [] } };
            break;
          default:
            req.filter = { _id: user.tenantId };
        }
      } else if (url.includes('/users')) {
        switch (level) {
          case 0:
            req.filter = {};
            break;
          case 1:
            req.filter = { tenantId: { $in: user.assignedTenantIds || [] } };
            break;
          case 2:
            req.filter = { tenantId: user.tenantId };
            break;
          default:
            req.filter = { tenantId: user.tenantId, _id: user._id };
        }
      } else {
        switch (level) {
          case 0:
            req.filter = {};
            break;
          case 1:
            req.filter = { tenantId: { $in: user.assignedTenantIds || [] } };
            break;
          case 2:
            req.filter = { tenantId: user.tenantId };
            break;
          default:
            req.filter = { tenantId: user.tenantId, userId: user._id };
        }
      }

      return next();

    } catch (error) {
      console.error('Access Scope Middleware Error:', error);
      return handleError(res, {
        status: 500,
        message: 'Internal Server Error in accessScope',
        error: error.message,
        buttons: [
          { text: 'Back to Dashboard', href: '/dashboard', style: 'primary' },
          { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
        ]
      });
    }
  };
};

module.exports = accessScope;
