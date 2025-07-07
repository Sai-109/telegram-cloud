import { Telegraf } from 'telegraf';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const bot = new Telegraf(process.env.BOT_TOKEN);

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
    const sent = await bot.telegram.sendDocument(process.env.CHANNEL_ID, {
      source: fs.createReadStream(file.filepath),
      filename: file.originalFilename,
    });

    res.status(200).json({ message: 'Uploaded to Telegram', fileId: sent.document?.file_id });
  } catch (error) {
    console.error("🔥 Telegram upload failed:", error);
    res.status(500).json({ message: 'Telegram upload failed', error: error.message });
  }
});

}
