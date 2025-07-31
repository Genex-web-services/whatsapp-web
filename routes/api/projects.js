const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');

// GET all projects for a tenant
router.get('/:tenantId/index', async (req, res) => {
  try {
    const projects = await Project.find({ tenantId: req.params.tenantId });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST create new project
router.post('/:tenantId/add', async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = new Project({ name, description, tenantId: req.params.tenantId });
    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add project' });
  }
});

// PUT update project
router.put('/:tenantId/edit/:id', async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// DELETE project
router.delete('/:tenantId/delete/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
