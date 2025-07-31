const express = require('express');
const router = express.Router({ mergeParams: true });
const Contact = require('../../models/Contact');
const authMiddleware = require('../../middlewares/authMiddleware');
const navbarMiddleware = require('../../middlewares/navbarMiddleware');
const hasPermission = require('../../middlewares/hasPermission');
const accessScope = require('../../middlewares/accessScope'); // ensure this is imported
const getModels = require('../../utils/getModels');
const handleError = require('../../utils/handleError');
// Middleware: Auth user injected with user.tenantId assumed

// 📥 Create a Contact
router.post('/:project_id/contacts', authMiddleware, navbarMiddleware, accessScope(), async (req, res) => {
  try {
    const contact = new Contact({
      ...req.body,
      project_id: req.params.project_id,
      tenant_id: req.user.tenantId,
    }); 
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Get All Contacts (with filter/search)
router.get('/:project_id/contacts', authMiddleware, navbarMiddleware, accessScope(), async (req, res) => {
  try {
    const { search } = req.query;
    const query = {
      project_id: req.params.project_id,
      tenant_id: req.user.tenantId,
      isDeleted: false
    };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🖊️ Update Contact
router.put('/:project_id/contacts/:id', authMiddleware, navbarMiddleware, accessScope(), async (req, res) => {
  try {
    const updated = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        tenant_id: req.user.tenantId,
        project_id: req.params.project_id,
        isDeleted: false
      },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Contact not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Soft Delete Contact
router.delete('/:project_id/contacts/:id', authMiddleware, navbarMiddleware, accessScope(), async (req, res) => {
  try {
    const deleted = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        tenant_id: req.user.tenantId,
        project_id: req.params.project_id,
        isDeleted: false
      },
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Deleted successfully', contact: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
