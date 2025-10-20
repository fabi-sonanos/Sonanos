const express = require('express');
const zlib = require('zlib');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const { clientOps, leadOps, activityOps } = require('./database');
const { authenticateToken, generateToken } = require('./middleware/auth');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

// ==================== AUTHENTICATION ENDPOINTS ====================

// Register new client (for admin use)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if client already exists
    const existingClient = clientOps.findByEmail.get(email);
    if (existingClient) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create client
    const result = clientOps.create.run(name, email, hashedPassword, company || '');
    const client = clientOps.findById.get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Client registered successfully',
      client: { id: client.id, name: client.name, email: client.email, company: client.company }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find client
    const client = clientOps.findByEmail.get(email);
    if (!client) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, client.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(client);

    res.json({
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const client = clientOps.findById.get(req.user.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

// ==================== LEAD ENDPOINTS ====================

// Get all leads for authenticated client
app.get('/api/leads', authenticateToken, (req, res) => {
  try {
    const leads = leadOps.findByClientId.all(req.user.id);
    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads', message: error.message });
  }
});

// Get lead statistics
app.get('/api/leads/stats', authenticateToken, (req, res) => {
  try {
    const stats = leadOps.getStats.get(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
});

// Get single lead
app.get('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const lead = leadOps.findById.get(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Ensure lead belongs to authenticated client
    if (lead.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get activities
    const activities = activityOps.findByLeadId.all(lead.id);

    res.json({ ...lead, activities });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead', message: error.message });
  }
});

// Create new lead
app.post('/api/leads', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, status, source, budget, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Lead name is required' });
    }

    const result = leadOps.create.run(
      req.user.id,
      name,
      email || '',
      phone || '',
      status || 'new',
      source || '',
      budget || '',
      notes || ''
    );

    // Log activity
    activityOps.create.run(
      result.lastInsertRowid,
      'created',
      'Lead created'
    );

    const lead = leadOps.findById.get(result.lastInsertRowid);
    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Failed to create lead', message: error.message });
  }
});

// Update lead
app.put('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const { name, email, phone, status, source, budget, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Lead name is required' });
    }

    // Verify lead belongs to client
    const existingLead = leadOps.findById.get(req.params.id);
    if (!existingLead || existingLead.client_id !== req.user.id) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    leadOps.update.run(
      name,
      email || '',
      phone || '',
      status || 'new',
      source || '',
      budget || '',
      notes || '',
      req.params.id,
      req.user.id
    );

    // Log activity if status changed
    if (status !== existingLead.status) {
      activityOps.create.run(
        req.params.id,
        'status_change',
        `Status changed from ${existingLead.status} to ${status}`
      );
    }

    const lead = leadOps.findById.get(req.params.id);
    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead', message: error.message });
  }
});

// Update lead status
app.patch('/api/leads/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Verify lead belongs to client
    const existingLead = leadOps.findById.get(req.params.id);
    if (!existingLead || existingLead.client_id !== req.user.id) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    leadOps.updateStatus.run(status, req.params.id, req.user.id);

    // Log activity
    activityOps.create.run(
      req.params.id,
      'status_change',
      `Status changed from ${existingLead.status} to ${status}`
    );

    const lead = leadOps.findById.get(req.params.id);
    res.json(lead);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status', message: error.message });
  }
});

// Delete lead
app.delete('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const result = leadOps.delete.run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead', message: error.message });
  }
});

// Add activity to lead
app.post('/api/leads/:id/activities', authenticateToken, (req, res) => {
  try {
    const { activity_type, description } = req.body;

    // Verify lead belongs to client
    const lead = leadOps.findById.get(req.params.id);
    if (!lead || lead.client_id !== req.user.id) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const result = activityOps.create.run(
      req.params.id,
      activity_type || 'note',
      description || ''
    );

    const activities = activityOps.findByLeadId.all(req.params.id);
    res.status(201).json(activities);
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ error: 'Failed to add activity', message: error.message });
  }
});

// ==================== GZIP DECOMPRESSOR (LEGACY) ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'AI Agency Dashboard & GZIP Decompressor running',
    version: '2.0.0'
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

// Catch-all route to serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Agency Dashboard Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});
