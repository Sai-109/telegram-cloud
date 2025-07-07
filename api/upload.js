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
      console.error("Form parse error:", err);
      return res.status(500).json({ message: 'Form parse failed' });
    }

    const file = files.file;
    if (!file) {
      console.error("No file found.");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      console.log("Uploading file:", file.originalFilename);
      const sent = await bot.telegram.sendDocument(process.env.CHANNEL_ID, {
        source: fs.createReadStream(file.filepath),
        filename: file.originalFilename,
      });

      res.status(200).json({ message: 'Uploaded to Telegram', fileId: sent.document?.file_id });
    } catch (error) {
      console.error("Telegram upload failed:", error);
      res.status(500).json({ message: 'Telegram upload failed', error: error.message });
    }
  });
}
