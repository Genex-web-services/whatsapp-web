const express = require('express');

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
router.post('/message/single', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ success: false, error: 'Number and message are required.' });
  }

  

  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    const isRegistered = await client.isRegisteredUser(formattedNumber);

    if (!isRegistered) {
      return res.status(400).json({ success: false, error: 'Number is not registered on WhatsApp.' });
    }

    await client.sendMessage(formattedNumber, message);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});
router.post('/:project_id/message/bulk', async (req, res) => {
  const { numbers, message } = req.body;

  if (!Array.isArray(numbers) || numbers.length === 0 || !message) {
    return res.status(400).json({ success: false, error: 'Numbers (array) and message are required.' });
  }

  const results = [];

  for (const number of numbers) {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;

    try {
      await client.sendMessage(formattedNumber, message);
      results.push({ number, success: true });
      console.log(`✅ Message sent to ${number}`);
    } catch (err) {
      console.error(`❌ Error sending to ${number}:`, err.message);
      results.push({ number, success: false, error: err.message });
    }

    // Wait for 30 seconds before sending the next message
    await new Promise(resolve => setTimeout(resolve, 30000));
  }

  res.json({ success: true, results });
});



/**
 * @swagger
 * /api/{project_id}/message/single:
 *   post:
 *     summary: Send a single message
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *                 example: '919999999999'
 *               message:
 *                 type: string
 *                 example: 'This is a GWS 365 WhatsApp Web Business API. This is a test message."'
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message_id:
 *                   type: string
 *       400:
 *         description: Bad request or validation error
 */

/**
 * @swagger
 * /api/{project_id}/message/single:
 *   get:
 *     summary: Get all messages for a project
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID to filter messages
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   number:
 *                     type: string
 *                   message:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: No messages found
 */

module.exports = router;
