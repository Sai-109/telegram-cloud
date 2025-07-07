const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'filedb.json');

module.exports = (req, res) => {
  try {
    if (!fs.existsSync(dbPath)) return res.status(200).json([]);
    const data = fs.readFileSync(dbPath);
    const files = JSON.parse(data);
    res.status(200).json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to read file list' });
  }
};
