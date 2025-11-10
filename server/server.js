import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const root = path.resolve(process.cwd());
const countriesPath = path.join(root, 'src', 'constants', 'countries.json');
const columnsPath = path.join(root, 'src', 'constants', 'columns.json');

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function writeJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/countries', (req, res) => {
  const data = readJson(countriesPath) || { countries: [] };
  res.json(data);
});

app.put('/api/countries', (req, res) => {
  const body = req.body;
  if (!body || !Array.isArray(body.countries)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  writeJson(countriesPath, { countries: body.countries });
  res.json({ countries: body.countries });
});

app.get('/api/columns', (req, res) => {
  const data = readJson(columnsPath) || [];
  res.json({ columns: data });
});

app.put('/api/columns', (req, res) => {
  const body = req.body;
  if (!body || !Array.isArray(body.columns)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  writeJson(columnsPath, body.columns);
  res.json({ columns: body.columns });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
