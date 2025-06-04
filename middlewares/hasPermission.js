const getModels = require('../utils/getModels');

function hasPermission(requiredPid) {
  return async (req, res, next) => {
    try {
      const { User, Role } = await getModels(); // await here, inside middleware

      const user = await User.findById(req.user._id);

      if (!user) return res.redirect('/login');


      const role = await Role.findOne({ roleCode: user.roleId }); // Adjust if needed
      console.log('Role fetched:', role);

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
