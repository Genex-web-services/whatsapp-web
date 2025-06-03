const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  companyName: { type: String },
  logoUrl: { type: String },
  industry: { type: String },
  address: { type: String },
  gstNumber: { type: String },
  contactEmail: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Organization', orgSchema);
