const express = require('express');

const router = express.Router();
const getModels = require('../utils/getModels');
// Load schema and create model

// ✅ CREATE - Add a new role
router.post('/', async (req, res) => {
  try {
    const { Role } = await getModels();
    const role = new Role(req.body);
    await role.save();
    res.status(201).json({ success: true, message: 'Role created successfully', data: role });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create role', error: error.message });
  }
});

// 📥 READ - Get all roles (with optional filtering by tenantId/product_id)
router.get('/', async (req, res) => {
  try {
    const { Role } = await getModels();
    const { tenantId, product_id } = req.query;
    const filter = {};
    if (tenantId) filter.tenantId = tenantId;
    if (product_id) filter.product_id = product_id;

    const roles = await Role.find(filter);
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching roles', error: error.message });
  }
});

// 📄 READ - Get a role by ID
router.get('/:id', async (req, res) => {
  try {
    const { Role } = await getModels();
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching role', error: error.message });
  }
});

// ✏️ UPDATE - Update role by ID
router.put('/:id', async (req, res) => {
  try {
    const { Role } = await getModels();
    const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedRole) return res.status(404).json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, message: 'Role updated successfully', data: updatedRole });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update role', error: error.message });
  }
});

// ❌ DELETE - Delete role by ID
router.delete('/:id', async (req, res) => {
  try {
    const { Role } = await getModels();
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) return res.status(404).json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete role', error: error.message });
  }
});

module.exports = router;
