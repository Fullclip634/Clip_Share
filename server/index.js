const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const db = new Database('codeshare.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS snippets (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    language TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API Routes
app.post('/api/paste', (req, res) => {
  const { code, language, customId } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Code content is required' });
  }

  let id = customId ? customId.trim() : uuidv4().slice(0, 8);
  
  // Basic validation for custom ID
  if (customId && !/^[a-zA-Z0-9-_]+$/.test(id)) {
     return res.status(400).json({ error: 'Custom ID can only contain letters, numbers, dashes, and underscores.' });
  }

  // Check if custom ID exists to determine INSERT or UPDATE
  const existing = db.prepare('SELECT id FROM snippets WHERE id = ?').get(id);

  try {
    if (existing) {
        // Update existing snippet
        const stmt = db.prepare('UPDATE snippets SET code = ?, language = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run(code, language || 'plaintext', id);
    } else {
        // Insert new snippet
        const stmt = db.prepare('INSERT INTO snippets (id, code, language) VALUES (?, ?, ?)');
        stmt.run(id, code, language || 'plaintext');
    }
    
    res.json({ id });
  } catch (error) {
    console.error('Error saving snippet:', error);
    res.status(500).json({ error: 'Failed to save snippet' });
  }
});

app.get('/api/paste/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('SELECT * FROM snippets WHERE id = ?');
  const snippet = stmt.get(id);

  if (!snippet) {
    return res.status(404).json({ error: 'Snippet not found' });
  }

  res.json(snippet);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
