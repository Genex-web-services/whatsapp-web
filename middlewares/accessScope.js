const getModels = require('../utils/getModels');

const accessScope = () => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }

      const { Role } = await getModels();
      const roleCode = typeof user.roleId === 'object' && user.roleId.toString ? user.roleId.toString() : user.roleId;
      const roles = await Role.findOne({ roleCode }).lean();

      if (!roles) {
        return res.status(403).json({ message: 'Forbidden: Role not found' });
      }

      const level = roles.level;
      req.scopeLevel = level; // optional but useful

      // Determine context by route
      const url = req.originalUrl;

      // Filter logic
      if (url.includes('/tenants')) {
        // Tenant model logic
        switch (level) {
          case 0:
            req.filter = {};
            break;
          case 1:
            req.filter = { _id: { $in: user.assignedTenantIds || [] } };
            break;
          case 2:
          default:
            req.filter = { _id: user.tenantId };
        }
      } else if (url.includes('/users')) {
        // User model logic
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
        // Default logic for other models
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

      next();
    } catch (error) {
      console.error('Access Scope Middleware Error:', error);
      res.status(500).json({ message: 'Internal Server Error in accessScope' });
    }
  };
};

module.exports = accessScope;
