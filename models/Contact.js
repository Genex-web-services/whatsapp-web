const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // or your tenant model
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project',
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: false,
  },
  email: {
    type: String,
  },
  company: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  notes: {
    type: String,
  },
  custom_fields: {
    type: Object,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Contact', contactSchema);
