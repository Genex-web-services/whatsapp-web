const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  client_id: { type: String, required: true, unique: true },
  client_name: String,
  redirect_uri: { type: String, required: true },
  secret: String,
});

module.exports = mongoose.model('Client', clientSchema);