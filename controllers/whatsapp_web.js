const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

const router = express.Router();

const client = new Client({
  authStrategy: new LocalAuth()
});

client.initialize();

client.on('qr', async (qr) => {
  global.qrCode = qr;
});

client.on('ready', () => {
  console.log('✅ WhatsApp is ready!');
});
let qrCode = null;

client.on('qr', (qr) => {
  global.qrString = qr;
  console.log("QR Code:", qr); // Optional
});
router.get('/generate-qr', async (req, res) => {
  if (!global.qrString) {
    return res.status(404).send('No QR available');
  }

  try {
    const qrImage = await qrcode.toDataURL(global.qrString);
    const img = Buffer.from(qrImage.split(',')[1], 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    console.log("QR Code generated successfully",img);
    res.end(img);
  } catch (err) {
    res.status(500).send('Failed to generate QR');
  }
});

router.get('/check-login-status', (req, res) => {
  res.json({ connected: client.info ? true : false });
});
// POST: Send text message to WhatsApp number
router.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ success: false, error: 'Number and message are required.' });
  }

  // Format number
  const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

  try {
    // 1️⃣ Check if number is registered on WhatsApp
    const isRegistered = await client.isRegisteredUser(formattedNumber);
    if (!isRegistered) {
      return res.status(400).json({ success: false, error: 'Number is not a registered WhatsApp user.' });
    }

    // 2️⃣ Get chat (to ensure message can be sent)
    const chat = await client.getChatById(formattedNumber);
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found for the number.' });
    }

    // 3️⃣ Send the message
    await client.sendMessage(formattedNumber, message);
    return res.json({ success: true, message: 'Message sent successfully via GWS 365 WhatsApp Web Business API!' });

  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error while sending message.' });
  }
});
router.post('/send-bulk', async (req, res) => {
  const { numbers, message } = req.body;

  if (!numbers || !Array.isArray(numbers) || numbers.length === 0 || !message) {
    return res.status(400).json({ success: false, error: 'Numbers array and message are required.' });
  }

  res.json({ success: true, message: 'Bulk messaging started.' }); // Respond early to avoid timeout

  for (let i = 0; i < numbers.length; i++) {
    const number = numbers[i];
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

    try {
      const isRegistered = await client.isRegisteredUser(formattedNumber);
      if (!isRegistered) {
        console.log(`❌ ${number} is not a registered WhatsApp user.`);
        continue;
      }

      const chat = await client.getChatById(formattedNumber);
      if (!chat) {
        console.log(`❌ Chat not found for ${number}`);
        continue;
      }

      await client.sendMessage(formattedNumber, message);
      console.log(`✅ Message sent to ${number}`);
    } catch (error) {
      console.error(`❌ Error sending to ${number}:`, error.message);
    }

    // ⏱ Wait 15 seconds before next message
    await new Promise(resolve => setTimeout(resolve, 15000));
  }

  console.log('🎉 Bulk message sending completed.');
});
router.get('/reconnect', (req, res) => {
  client.initialize();
  res.json({ success: true, message: 'Reconnected to WhatsApp Web.' });
});
module.exports = router;
