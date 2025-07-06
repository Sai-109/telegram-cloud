const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const messages = await bot.telegram.getUpdates({
      chat_id: process.env.CHANNEL_ID,
      limit: 100,
    });

    const files = messages
      .filter((msg) => msg.document)
      .map((msg) => ({
        messageId: msg.message_id,
        fileName: msg.document.file_name,
        fileUrl: `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${msg.document.file_id}`,
      }));

    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
};