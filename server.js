const express = require('express');
const zlib = require('zlib');
const cors = require('cors');
const app = express();

// Enable CORS für n8n
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'GZIP Decompressor läuft', usage: 'POST /decompress mit {base64: "..."} oder {data: {...}}' });
});

// Decompress Endpoint - funktioniert mit beiden Formaten
app.post('/decompress', (req, res) => {
  try {
    let buffer;
    
    // Format 1: Base64 String direkt
    if (req.body.base64) {
      buffer = Buffer.from(req.body.base64, 'base64');
    } 
    // Format 2: n8n Buffer Object
    else if (req.body.data && req.body.data._handle) {
      const bufferData = req.body.data._handle.buffer.data;
      buffer = Buffer.from(bufferData);
    }
    // Format 3: Direkter Buffer Array
    else if (req.body._handle && req.body._handle.buffer) {
      const bufferData = req.body._handle.buffer.data;
      buffer = Buffer.from(bufferData);
    }
    else {
      return res.status(400).json({ error: 'Kein gültiges Datenformat gefunden' });
    }
    
    // GZIP Check
    if (buffer[0] !== 0x1F || buffer[1] !== 0x8B) {
      // Vielleicht ist es schon XML?
      const text = buffer.toString('utf-8');
      if (text.includes('<?xml') || text.includes('<s:Envelope')) {
        return res.send(text);
      }
      return res.status(400).json({ error: 'Keine GZIP-Daten' });
    }
    
    // Dekomprimiere
    const xml = zlib.gunzipSync(buffer).toString('utf-8');
    
    // Sende nur den XML String zurück
    res.type('text/xml').send(xml);
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Dekomprimierung fehlgeschlagen',
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});