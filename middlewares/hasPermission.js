const User = require('../models/User');
const Role = require('../models/Role');

function hasPermission(requiredPid) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.redirect('/login');

      const role = await Role.findOne({ roleCode: user.roleId }); // Adjust if you use a different key
      console.log('Role fetched:', role);

      // If role.permissions contains "*", allow all
      if (role && Array.isArray(role.permissions) && role.permissions.includes("*")) {
        return next();
      }

      // If requiredPid is not found, deny
      if (!role || !Array.isArray(role.permissions) || !role.permissions.includes(requiredPid)) {
        console.log(`Permission "${requiredPid}" not found in role permissions`, role?.permissions);
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
