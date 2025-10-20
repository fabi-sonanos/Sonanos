# AI Agency - Client Lead Dashboard

A professional dashboard for financial advisors to track and manage leads from your AI agency.

## Features

- **Lead Management**: Create, edit, and track leads through different stages
- **Status Tracking**: Monitor leads through stages (New, Contacted, Qualified, Converted, Lost)
- **Statistics Dashboard**: View conversion rates and lead distribution
- **Secure Authentication**: JWT-based authentication for client access
- **Activity Logging**: Track changes and interactions with each lead
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

**Backend:**
- Node.js & Express
- SQLite database
- JWT authentication
- bcrypt for password hashing

**Frontend:**
- React 18
- React Router for navigation
- Axios for API calls
- Custom CSS with responsive design

## Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

4. Create demo client account:
```bash
node setup-demo.js
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm start
```

2. In a new terminal, start the React development server:
```bash
npm run client
```

3. Open your browser to `http://localhost:3001`

### Production Mode

1. Build the React frontend:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

## Demo Login Credentials

After running `node setup-demo.js`:

- **Email**: demo@financialadvisor.com
- **Password**: demo123

## Creating New Client Accounts

To create a new client account, use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Client Name",
    "email": "client@example.com",
    "password": "securepassword",
    "company": "Company Name"
  }'
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new client
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/stats` - Get lead statistics
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `PATCH /api/leads/:id/status` - Update lead status
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/activities` - Add activity to lead

### Legacy
- `POST /decompress` - GZIP decompression (legacy feature)

## Lead Status Flow

1. **New** - Fresh lead, not yet contacted
2. **Contacted** - Initial contact made
3. **Qualified** - Lead meets criteria, potential customer
4. **Converted** - Lead became a client
5. **Lost** - Lead not interested or unresponsive

## Customization

### Changing Lead Fields

Edit `database.js` to modify the lead schema, then update the corresponding:
- API endpoints in `server.js`
- Form fields in `client/src/components/LeadModal.js`
- Display fields in `client/src/components/LeadList.js`

### Styling

All styles are in component-specific CSS files:
- Global styles: `client/src/index.css`
- Component styles: `client/src/components/*.css`

## Security Notes

- Change the `JWT_SECRET` in production
- Use HTTPS in production
- Consider adding rate limiting
- Implement proper backup strategy for the database
- Consider using a production database (PostgreSQL, MySQL) instead of SQLite for scale

## License

Proprietary - AI Agency

## Support

For support, contact your AI agency representative.
