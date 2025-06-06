const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const navbarMiddleware = require('../middlewares/navbarMiddleware');
const hasPermission = require('../middlewares/hasPermission');
const accessScope = require('../middlewares/accessScope');
const getModels = require('../utils/getModels');
const { redirectIfLoggedIn, renderWithLocals } = require('../middlewares/common'); // adjust path as needed

router.get('/users/list',
  authMiddleware,
  navbarMiddleware,
  hasPermission('list_user'),
  accessScope(),
  async (req, res) => {
    const { User } = await getModels();
    try {
      const users = await User.find(req.filter);
      renderWithLocals(res, 'users/list', req, { users });
    } catch (error) {
      console.error("Error fetching users: ", error);
      res.status(500).send('Error fetching users');
    }
  }
);  
router.get('/users/add',
  authMiddleware,
  navbarMiddleware,
  hasPermission('add_user'),
  accessScope(),
  async (req, res) => {
    const { Role } = await getModels();
    const roles = await Role.find(req.filter);
     const currentRole = await Role.find({roleCode : req.user.roleId});
    renderWithLocals(res, 'users/add', req, {
      user: {},
      roles,
      Type: 'add',
      currentRole,
      Role,
      tenantId: req.user.tenantId
    });
  }
);
router.get('/users/edit/:id',
  authMiddleware,
  navbarMiddleware,
  hasPermission('edit_user'),
  accessScope(),
  async (req, res) => {
    const { User, Role } = await getModels();
    try {
      const user = await User.findById(req.params.id);
      const roles = await Role.find(req.filter);
      if (!user) return res.status(404).send('User not found');
      renderWithLocals(res, 'users/add', req, {
        user,
        roles,
        Type: 'edit',
        tenantId: req.user.tenantId
      });
    } catch (error) {
      console.error("Error loading user for edit: ", error);
      res.status(500).send('Error loading user');
    }
  }
);
router.get('/users/delete/:id',
  authMiddleware,
  navbarMiddleware,
  hasPermission('delete_user'),
  accessScope(),
  async (req, res) => {
    const { User } = await getModels();
    try {
      await User.findByIdAndDelete(req.params.id);
      res.redirect('/users/list');
    } catch (error) {
      console.error("Error deleting user: ", error);
      res.status(500).send('Error deleting user');
    }
  }
);




module.exports = router;
