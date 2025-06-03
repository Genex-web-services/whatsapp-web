const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Role name like "Manager", "HR"
  roleCode: { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',type: String, required: true }, // Which product this role is for

  // Permissions granted under this role
  permissions: [String], // Array of permission `pid`s like ['add_user', 'delete_user']

  isDefault: { type: Boolean, default: false }, // Optional: default role for new users
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', roleSchema);
// This schema defines a Role model with fields for name, tenantId, product_id, permissions, and isDefault.
// It can be used to manage user roles and permissions in a multi-tenant application.