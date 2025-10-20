const bcrypt = require('bcrypt');
const { clientOps, leadOps } = require('./database');

async function setupDemo() {
  try {
    console.log('Setting up demo client account...');

    // Demo credentials
    const demoClient = {
      name: 'Financial Advisor Demo',
      email: 'demo@financialadvisor.com',
      password: 'demo123',
      company: 'Demo Financial Services'
    };

    // Check if demo client already exists
    const existing = clientOps.findByEmail.get(demoClient.email);

    if (existing) {
      console.log('Demo client already exists!');
      console.log('\nLogin credentials:');
      console.log('Email:', demoClient.email);
      console.log('Password:', demoClient.password);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(demoClient.password, 10);

    // Create client
    const result = clientOps.create.run(
      demoClient.name,
      demoClient.email,
      hashedPassword,
      demoClient.company
    );

    console.log('Demo client created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email:', demoClient.email);
    console.log('Password:', demoClient.password);

    // Add some sample leads
    const clientId = result.lastInsertRowid;
    const sampleLeads = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        status: 'new',
        source: 'Website Contact Form',
        budget: '$250,000 - $500,000',
        notes: 'Interested in retirement planning and investment management.'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 234-5678',
        status: 'contacted',
        source: 'Referral',
        budget: '$100,000 - $250,000',
        notes: 'Looking for wealth management services. Has existing portfolio.'
      },
      {
        name: 'Michael Brown',
        email: 'mbrown@example.com',
        phone: '+1 (555) 345-6789',
        status: 'qualified',
        source: 'LinkedIn',
        budget: '$500,000+',
        notes: 'Business owner seeking comprehensive financial planning.'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+1 (555) 456-7890',
        status: 'converted',
        source: 'Google Ads',
        budget: '$75,000 - $100,000',
        notes: 'Signed up for retirement planning package.'
      },
      {
        name: 'Robert Wilson',
        email: 'r.wilson@example.com',
        phone: '+1 (555) 567-8901',
        status: 'new',
        source: 'Facebook',
        budget: '$50,000 - $75,000',
        notes: 'First-time investor, needs guidance on starting portfolio.'
      }
    ];

    console.log('\nAdding sample leads...');
    sampleLeads.forEach(lead => {
      leadOps.create.run(
        clientId,
        lead.name,
        lead.email,
        lead.phone,
        lead.status,
        lead.source,
        lead.budget,
        lead.notes
      );
    });

    console.log(`Added ${sampleLeads.length} sample leads!`);
    console.log('\nSetup complete! You can now login to the dashboard.');
    console.log('Run: npm start');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupDemo();
