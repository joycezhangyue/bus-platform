import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ===== SQLite Database =====
const db = new Database(path.join(__dirname, 'data', 'trips.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    driver TEXT NOT NULL,
    destination TEXT NOT NULL,
    passenger TEXT NOT NULL,
    departure_day TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    return_day TEXT,
    return_time TEXT,
    confirmed INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

// ===== SSE Clients =====
const sseClients = new Set();

function broadcastTrips() {
  const trips = db.prepare('SELECT * FROM trips ORDER BY created_at DESC').all();
  const data = JSON.stringify({ type: 'trips', trips });
  for (const client of sseClients) {
    client.write(`data: ${data}\n\n`);
  }
}

// ===== API Routes =====

// Get all trips
app.get('/api/trips', (_req, res) => {
  try {
    const trips = db.prepare('SELECT * FROM trips ORDER BY created_at DESC').all();
    res.json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create trip
app.post('/api/trips', (req, res) => {
  try {
    const { id, driver, destination, passenger, departureDay, departureTime, returnDay, returnTime, confirmed, note } = req.body;
    const stmt = db.prepare(`
      INSERT INTO trips (id, driver, destination, passenger, departure_day, departure_time, return_day, return_time, confirmed, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, driver, destination, passenger, departureDay, departureTime, returnDay || null, returnTime || null, confirmed ? 1 : 0, note || null);
    broadcastTrips();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update trip
app.put('/api/trips/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { driver, destination, passenger, departureDay, departureTime, returnDay, returnTime, confirmed, note } = req.body;
    const stmt = db.prepare(`
      UPDATE trips SET
        driver = ?, destination = ?, passenger = ?,
        departure_day = ?, departure_time = ?,
        return_day = ?, return_time = ?,
        confirmed = ?, note = ?
      WHERE id = ?
    `);
    const result = stmt.run(driver, destination, passenger, departureDay, departureTime, returnDay || null, returnTime || null, confirmed ? 1 : 0, note || null, id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    broadcastTrips();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete trip
app.delete('/api/trips/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM trips WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    broadcastTrips();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SSE endpoint for real-time sync
app.get('/api/trips/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  sseClients.add(res);

  // Send initial data
  const trips = db.prepare('SELECT * FROM trips ORDER BY created_at DESC').all();
  res.write(`data: ${JSON.stringify({ type: 'trips', trips })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Serve static files in production
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
