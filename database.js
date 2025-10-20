const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'leads.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'new',
    source TEXT,
    budget TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS lead_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id)
  );
`);

// Client operations
const clientOps = {
  create: db.prepare(`
    INSERT INTO clients (name, email, password, company)
    VALUES (?, ?, ?, ?)
  `),

  findByEmail: db.prepare(`
    SELECT * FROM clients WHERE email = ?
  `),

  findById: db.prepare(`
    SELECT id, name, email, company, created_at FROM clients WHERE id = ?
  `)
};

// Lead operations
const leadOps = {
  create: db.prepare(`
    INSERT INTO leads (client_id, name, email, phone, status, source, budget, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  findByClientId: db.prepare(`
    SELECT * FROM leads WHERE client_id = ? ORDER BY created_at DESC
  `),

  findById: db.prepare(`
    SELECT * FROM leads WHERE id = ?
  `),

  update: db.prepare(`
    UPDATE leads
    SET name = ?, email = ?, phone = ?, status = ?, source = ?, budget = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND client_id = ?
  `),

  updateStatus: db.prepare(`
    UPDATE leads
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND client_id = ?
  `),

  delete: db.prepare(`
    DELETE FROM leads WHERE id = ? AND client_id = ?
  `),

  getStats: db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
      SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
      SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified,
      SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
      SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
    FROM leads WHERE client_id = ?
  `)
};

// Activity operations
const activityOps = {
  create: db.prepare(`
    INSERT INTO lead_activities (lead_id, activity_type, description)
    VALUES (?, ?, ?)
  `),

  findByLeadId: db.prepare(`
    SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC
  `)
};

module.exports = {
  db,
  clientOps,
  leadOps,
  activityOps
};
