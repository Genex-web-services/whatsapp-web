// routes/api.js or wherever you're defining routes
const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const { qrCodeData } = require('../../controllers/whatsapp_web'); // adjust path as needed
const { isConnected } = require('../../controllers/whatsapp_web'); // adjust path
router.get('/generate-qr', async (req, res) => {
  try {
    if (!qrCodeData) {
      return res.status(404).send('QR code not generated yet.');
    }

    const qrImage = await qrcode.toDataURL(qrCodeData);
    const imgBuffer = Buffer.from(qrImage.split(',')[1], 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length,
    });
    res.end(imgBuffer);
  } catch (err) {
    console.error('QR generate error:', err);
    res.status(500).send('Error generating QR');
  }
});


router.get('/check-login-status', (req, res) => {
  res.json({ connected: isConnected });
});
