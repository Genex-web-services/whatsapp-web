const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Owner
  type: { type: String, enum: ['individual', 'organization'], required: true },
  productAccess: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Pre-save hook to ensure 'admin' and 'pay' are always present in productAccess
tenantSchema.pre('save', function (next) {
  const requiredAccess = ['admin', 'pay'];
  this.productAccess = Array.from(new Set([...this.productAccess, ...requiredAccess]));
  next();
});

module.exports = mongoose.model('Tenant', tenantSchema);
