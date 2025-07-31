const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  to: String,
  message: String,
  status: { type: String, default: 'pending' },
  sentAt: Date
});

module.exports = mongoose.model('Message', MessageSchema);
