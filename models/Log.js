const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'login'
  email: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  method: { type: String },
  url: { type: String },
  client_id: { type: String },
  redirect_uri: { type: String },
  state: { type: String },
  success: { type: Boolean },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);
