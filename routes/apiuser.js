const express = require('express');
const router = express.Router();
const getModels = require('../utils/getModels');

// CREATE a user
router.post('/', async (req, res) => {
  try {
     const { User } = await getModels();
    const {
      name, email, password, tenantId, userType, isActive, roleId, referredBy
    } = req.body;

    if (!email || !password || !tenantId) {
      return res.status(400).json({ message: 'Email, Password, and Tenant ID are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists.' });

    const user = new User({
      name, email, password, tenantId,
      userType: userType || 'single',
      isActive: isActive ?? true,
      roleId: roleId || 'orgAdmin',
      referredBy: referredBy || '6841fb36dd9a2cc544c35a13'
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// READ all users
router.get('/', async (req, res) => {
  try {
     const { User } = await getModels();
    const users = await User.find().populate('tenantId referredBy', 'name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// READ one user by ID
router.get('/:id', async (req, res) => {
  try {
     const { User } = await getModels();
    const user = await User.findById(req.params.id).populate('tenantId referredBy', 'name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// UPDATE user
router.put('/:id', async (req, res) => {
  try {
     const { User } = await getModels();
    const updateData = { ...req.body };

    // If password is being updated, hash it manually
    if (updateData.password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
     const { User } = await getModels();
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
