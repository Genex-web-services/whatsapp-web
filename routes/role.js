const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const navbarMiddleware = require('../middlewares/navbarMiddleware');
const hasPermission = require('../middlewares/hasPermission');
const accessScope = require('../middlewares/accessScope'); // ensure this is imported
const getModels = require('../utils/getModels'); // Ensure this points to your utility function
const { redirectIfLoggedIn, renderWithLocals } = require('../middlewares/common'); // adjust path as needed
const handleError = require('../utils/handleError');
// 📝 1. List Roles (Exclude 'superAdmin')
router.get('/Roles-and-permission/list',
  authMiddleware,
  navbarMiddleware,
  hasPermission('list_role'),
  accessScope(),
  async (req, res) => {
    const { Role,Product } = await getModels();

    try {
    const products = await Product.find({});
              const currentRole = await Role.find({roleCode : req.user.roleId});
      const roles = await Role.find({ ...req.filter });
      renderWithLocals(res, 'role/list', req, { roles,products,currentRole  });
    } catch (err) {
      console.error('Error fetching Roles:', err);
      return handleError(res, {
  status: 500,
  message: 'Server Error. Please try again later.',
  type: 'text', // or 'html' or 'json' depending on context
  error: null,
  buttons: [
    { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
    { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
  ]
});
    }
  }
);

// ➕ 2. Add Role View (Render form)
router.get('/Roles-and-permission/add',
  authMiddleware,
  navbarMiddleware,
  hasPermission('add_role'),
  accessScope(),
  async (req, res) => {
    const { Role,Product } = await getModels();

    try {
      const product = await Product.find({});

        const Roles = await Role.find({});
        const currentRole = await Role.find({roleCode : req.user.roleId});
      renderWithLocals(res, 'role/add', req, { role:Roles,Type:'add',product,currentRole,tenantId: req.user.tenantId });
    } catch (err) {
      console.error('Error rendering Add Role:', err);
      return handleError(res, {
  status: 500,
  message: 'Server Error. Please try again later.',
  type: 'text', // or 'html' or 'json' depending on context
  error: null,
  buttons: [
    { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
    { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
  ]
});
    }
  }
);

// ✏️ 3. Edit Role View by ID
router.get('/Roles-and-permission/edit/:id',
  authMiddleware,
  navbarMiddleware,
  hasPermission('edit_role'),
  accessScope(),
  async (req, res) => {
    const { Role,Product } = await getModels();

    try {
        const product = await Product.find({});
      const role = await Role.findById(req.params.id);
              const currentRole = await Role.find({roleCode : req.user.roleId});
      if (!role) return res.status(404).send('Role not found');
      renderWithLocals(res, 'role/add', req, { role,Type:'edit',product,currentRole,tenantId: req.user.tenantId  });
    } catch (err) {
      console.error('Error loading role for editing:', err);
      return handleError(res, {
  status: 500,
  message: 'Server Error. Please try again later.',
  type: 'text', // or 'html' or 'json' depending on context
  error: null,
  buttons: [
    { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
    { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
  ]
});
    }
  }
);

// 📄 4. View Single Role Details
router.get('/Roles-and-permission/view/:id',
  authMiddleware,
  navbarMiddleware,
  hasPermission('view_role'),
  accessScope(),
  async (req, res) => {
    const { Role,Product } = await getModels();

    try {
      const role = await Role.findById(req.params.id);
      if (!role) return res.status(404).send('Role not found');
      renderWithLocals(res, 'role/view', req, { role,Product });
    } catch (err) {
      console.error('Error fetching role details:', err);
      return handleError(res, {
  status: 500,
  message: 'Server Error. Please try again later.',
  type: 'text', // or 'html' or 'json' depending on context
  error: null,
  buttons: [
    { text: 'Reload Page', href: 'javascript:location.reload()', style: 'secondary' },
    { text: 'Request Support', href: 'mailto:support@gws365.in', style: 'danger' }
  ]
});
    }
  }
);

module.exports = router;
