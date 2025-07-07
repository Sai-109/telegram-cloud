import { Telegraf } from 'telegraf';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: '/tmp' });
const bot = new Telegraf(process.env.BOT_TOKEN);
const dbPath = path.resolve('/tmp/filedb.json');

// Disable body parsing by Next/Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'Upload failed' });
    }

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    try {
      const filePath = path.join('/tmp', file.filename);
      const sentMsg = await bot.telegram.sendDocument(process.env.CHANNEL_ID, {
        source: filePath,
        filename: file.originalname,
      });

      const fileInfo = {
        fileName: file.originalname,
        messageId: sentMsg.message_id,
      };

      // Save to temp JSON DB
      let db = [];
      if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath));
      }
      db.push(fileInfo);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      res.status(200).json({ message: 'Uploaded successfully', file: fileInfo });
    } catch (error) {
      console.error('Telegram error:', error);
      res.status(500).json({ message: 'Telegram upload failed' });
    }
  });
}
