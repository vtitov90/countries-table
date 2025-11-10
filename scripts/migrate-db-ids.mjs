import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dbPath = path.join(root, 'db.json');

if (!fs.existsSync(dbPath)) {
  console.error('db.json not found at', dbPath);
  process.exit(1);
}

const raw = fs.readFileSync(dbPath, 'utf-8');
let db;
try {
  db = JSON.parse(raw);
} catch (e) {
  console.error('Failed to parse db.json:', e.message);
  process.exit(1);
}

if (!Array.isArray(db.countries)) {
  console.error('db.json does not contain a countries array');
  process.exit(1);
}

const seen = new Set();
db.countries = db.countries.map((c) => {
  const next = { ...c };
  // Always replace with UUID string
  next.id = uuidv4();
  while (seen.has(next.id)) {
    next.id = uuidv4();
  }
  seen.add(next.id);
  return next;
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Migrated countries ids in db.json to UUID strings.');
