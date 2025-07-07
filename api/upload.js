import { Telegraf } from 'telegraf';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import nextConnect from 'next-connect';

const upload = multer({ dest: '/tmp' });
const bot = new Telegraf(process.env.BOT_TOKEN);
const dbPath = '/tmp/filedb.json';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = nextConnect();

handler.use(upload.single('file'));

handler.post(async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const sentMsg = await bot.telegram.sendDocument(process.env.CHANNEL_ID, {
      source: file.path,
      filename: file.originalname,
    });

    const fileInfo = {
      fileName: file.originalname,
      messageId: sentMsg.message_id,
    };

    let db = [];
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath));
    }

    db.push(fileInfo);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.status(200).json({ message: 'Uploaded successfully', file: fileInfo });
  } catch (error) {
    console.error('Telegram Error:', error);
    res.status(500).json({ message: 'Telegram upload failed' });
  }
});

export default handler;
