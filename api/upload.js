const { Telegraf } = require('telegraf');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const bot = new Telegraf(process.env.BOT_TOKEN);

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await new Promise((resolve, reject) => {
      upload.single('file')(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await bot.telegram.sendDocument(process.env.CHANNEL_ID, {
      source: file.buffer,
      filename: file.originalname,
    });

    res.status(200).json({ success: true, messageId: result.message_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};