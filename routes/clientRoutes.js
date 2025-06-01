// File: routes/clientRoutes.js

const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { v4: uuidv4 } = require('uuid');

// Create Client
// Create Client
router.post('/', async (req, res) => {
  const { client_name, redirect_uri, secret } = req.body;

  try {
    let client_id;
    let exists;

    // Generate unique client_id
    do {
      client_id = uuidv4(); // or custom logic
      exists = await Client.findOne({ client_id });
    } while (exists);

    const client = new Client({ client_id, client_name, redirect_uri, secret });
    await client.save();

    res.status(201).json({ message: 'Client created successfully', client });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get One Client
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Client
router.put('/:id', async (req, res) => {
  const { client_id, client_name, redirect_uri, secret } = req.body;

  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    client.client_id = client_id || client.client_id;
    client.client_name = client_name || client.client_name;
    client.redirect_uri = redirect_uri || client.redirect_uri;
    client.secret = secret || client.secret;

    await client.save();
    res.json({ message: 'Client updated', client });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
