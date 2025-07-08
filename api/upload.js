import { Telegraf } from 'telegraf';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const bot = new Telegraf(process.env.BOT_TOKEN);
const CHANNEL_ID = process.env.CHANNEL_ID;
const DB_PATH = '/tmp/filedb.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Form parse error:", err);
      return res.status(500).json({ message: 'Form parse failed' });
    }

    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file || !file.filepath) {
      console.error("❌ No valid file uploaded:", file);
      return res.status(400).json({ message: "File upload failed" });
    }

    try {
      console.log("📤 Uploading to Telegram:", file.originalFilename);
      const sent = await bot.telegram.sendDocument(CHANNEL_ID, {
        source: fs.createReadStream(file.filepath),
        filename: file.originalFilename,
      });

      const messageId = sent.message_id;
      const fileId = sent.document?.file_id;
      const mimeType = sent.document?.mime_type || "unknown";
      const size = sent.document?.file_size || file.size || 0;
      const date = new Date().toISOString();
      const fileType = mimeType.split("/")[0];

      // ✅ Fix: handle array or string tags safely
      const rawTags = Array.isArray(fields.tags) ? fields.tags[0] : (fields.tags || "");
      const tags = rawTags.split(",").map(t => t.trim()).filter(Boolean);

      const preview = fileType === 'image'
        ? `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileId}`
        : null;

      const metadata = {
        filename: file.originalFilename,
        size,
        type: mimeType,
        tags,
        date,
        url: `https://t.me/c/${CHANNEL_ID.replace('-100', '')}/${messageId}`,
        preview,
      };

      // 🗂️ Read/Write metadata to /tmp/filedb.json
      let filedb = [];
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        filedb = JSON.parse(raw);
      }

      filedb.push(metadata);
      fs.writeFileSync(DB_PATH, JSON.stringify(filedb, null, 2));

      res.status(200).json({ message: 'Uploaded & metadata stored', file: metadata });

    } catch (error) {
      console.error("🔥 Telegram upload failed:", error);
      res.status(500).json({
        message: 'Telegram upload failed',
        error: error.message || JSON.stringify(error),
      });
    }
  });
}
