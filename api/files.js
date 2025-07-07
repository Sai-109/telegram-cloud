import fs from 'fs';

export default function handler(req, res) {
  const dbPath = '/tmp/filedb.json';

  try {
    if (!fs.existsSync(dbPath)) return res.status(200).json([]);
    const data = fs.readFileSync(dbPath);
    const files = JSON.parse(data);
    res.status(200).json(files);
  } catch (err) {
    console.error('Read error:', err);
    res.status(500).json({ message: 'Failed to read file list' });
  }
}
