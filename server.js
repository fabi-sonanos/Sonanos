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
  res.json({ 
    status: 'GZIP Decompressor läuft', 
    usage: 'POST /decompress mit {base64: "..."} oder POST / mit {base64: "..."}' 
  });
});

// Hauptendpoint für n8n - akzeptiert beide Pfade
app.post(['/', '/decompress'], (req, res) => {
  try {
    console.log('Received request body keys:', Object.keys(req.body));
    console.log('Has base64 field:', !!req.body.base64);
    
    let buffer;
    
    // Format 1: Base64 String direkt im body
    if (req.body.base64) {
      console.log('Using Format 1: base64 string');
      console.log('Base64 length:', req.body.base64.length);
      buffer = Buffer.from(req.body.base64, 'base64');
    } 
    // Format 2: n8n Buffer Object
    else if (req.body.data && req.body.data._handle) {
      console.log('Using Format 2: n8n buffer object');
      const bufferData = req.body.data._handle.buffer.data;
      buffer = Buffer.from(bufferData);
    }
    // Format 3: Direkter Buffer Array
    else if (req.body._handle && req.body._handle.buffer) {
      console.log('Using Format 3: direct buffer');
      const bufferData = req.body._handle.buffer.data;
      buffer = Buffer.from(bufferData);
    }
    else {
      console.error('No valid format found. Body structure:', JSON.stringify(req.body, null, 2).substring(0, 500));
      return res.status(400).json({ 
        error: 'Kein gültiges Datenformat gefunden',
        receivedKeys: Object.keys(req.body),
        hint: 'Expected {base64: "..."} or buffer object'
      });
    }
    
    console.log('Buffer size:', buffer.length);
    console.log('First 3 bytes:', [buffer[0], buffer[1], buffer[2]]);
    
    // GZIP Check (0x1F = 31, 0x8B = 139, 0x08 = 8)
    if (buffer[0] !== 0x1F || buffer[1] !== 0x8B) {
      console.warn('Not GZIP! First bytes:', [buffer[0], buffer[1]]);
      
      // Vielleicht ist es schon XML?
      const text = buffer.toString('utf-8');
      if (text.includes('<?xml') || text.includes('<s:Envelope') || text.includes('<soap:Envelope')) {
        console.log('Already XML, returning as-is');
        // Als JSON-Objekt zurückgeben für n8n
        return res.json({ 
          data: text,
          wasCompressed: false,
          length: text.length
        });
      }
      
      return res.status(400).json({ 
        error: 'Keine GZIP-Daten',
        firstBytes: [buffer[0], buffer[1], buffer[2]],
        expectedGzipHeader: [31, 139, 8]
      });
    }
    
    // Dekomprimiere
    console.log('Decompressing GZIP...');
    const xml = zlib.gunzipSync(buffer).toString('utf-8');
    console.log('Decompressed XML length:', xml.length);
    console.log('First 200 chars of XML:', xml.substring(0, 200));
    
    // WICHTIG: Als JSON-Objekt für n8n zurückgeben
    res.json({ 
      data: xml,
      wasCompressed: true,
      originalSize: buffer.length,
      decompressedSize: xml.length,
      compressionRatio: (buffer.length / xml.length * 100).toFixed(2) + '%'
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Dekomprimierung fehlgeschlagen',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GZIP Decompressor Server läuft auf Port ${PORT}`);
});
