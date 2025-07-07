import { Telegraf } from 'telegraf';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const bot = new Telegraf(process.env.BOT_TOKEN);
const dbPath = '/tmp/filedb.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: '/tmp',
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form error:', err);
      return res.status(500).json({ message: 'Upload failed' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const sentMsg = await bot.telegram.sendDocument(process.env.CHANNEL_ID, {
        source: fs.createReadStream(file.filepath),
        filename: file.originalFilename,
      });

      const fileInfo = {
        fileName: file.originalFilename,
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
      console.error('Telegram error:', error);
      res.status(500).json({ message: 'Telegram upload failed' });
    }
  });
}
