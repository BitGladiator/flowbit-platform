#  Flowbit Platform - Multi-Tenant SaaS Application

A complete multi-tenant support ticket management system built with:

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Module Federation (Micro-frontends)
- **Workflow Automation**: n8n (coming in Phase 5)
- **Authentication**: JWT with role-based access control

---

##  Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Shell (Host)                    │
│                     Port: 3000                           │
│  ┌────────────┐  ┌──────────────────────────────────┐  │
│  │  Login     │  │  Dashboard + Dynamic Navigation  │  │
│  └────────────┘  └──────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │ Module Federation
                            ↓
┌─────────────────────────────────────────────────────────┐
│            Support Tickets App (Remote)                  │
│                     Port: 3002                           │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │ Ticket   │  │  Ticket    │  │  Ticket Details  │   │
│  │ List     │  │  Form      │  │  Modal           │   │
│  └──────────┘  └────────────┘  └──────────────────┘   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    API Server                            │
│                     Port: 3001                           │
│  ┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Auth   │  │ Tickets │  │ Webhooks │  │ Registry │  │
│  └────────┘  └─────────┘  └──────────┘  └──────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    MongoDB                               │
│                   Port: 27017                            │
│  ┌──────────┐  ┌────────┐  ┌──────────────────────┐   │
│  │ Users    │  │Tickets │  │ Customers (Tenants) │   │
│  └──────────┘  └────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

##  Features

### Completed (Phases 1-4)

- **Multi-Tenancy**: Complete data isolation between tenants
- **Authentication**: JWT-based login with role-based access control
- **Ticket Management**: Full CRUD operations with real-time updates
- **Micro-frontends**: Module Federation for dynamic app loading
- **Responsive UI**: Modern, clean interface

### Coming Soon (Phases 5-7)

- **n8n Workflow**: Automated ticket processing
- **Docker**: Containerized deployment
- **Testing**: Unit tests + E2E tests with Cypress
- **CI/CD**: GitHub Actions workflow

---

##  Quick Start

### Prerequisites

- Node.js v18+
- Docker Desktop
- MongoDB (via Docker)

### Installation

1. **Clone the repository**

```bash
   git clone https://github.com/YOUR_USERNAME/flowbit-platform.git
   cd flowbit-platform
```

2. **Start MongoDB**

```bash
   docker run -d --name mongodb -p 27017:27017 mongo:6
```

3. **Setup API**

```bash
   cd packages/api
   npm install
   cp .env.example .env
   npm run seed
   npm run dev
```

4. **Setup Shell**

```bash
   cd packages/shell
   npm install
   npm start
```

5. **Setup Support Tickets App**

```bash
   cd packages/support-tickets-app
   npm install
   npm start
```

### Access the Application

- **Shell**: http://localhost:3000
- **API**: http://localhost:3001
- **Tickets App**: http://localhost:3002

### Test Credentials

```
LogisticsCo Admin: admin@logisticsco.com / password123
RetailGmbH Admin: admin@retailgmbh.com / password123
```

---

##  Project Structure

```
flowbit-platform/
├── packages/
│   ├── api/                      # Backend API
│   │   ├── src/
│   │   │   ├── config/          # Database connection
│   │   │   ├── middleware/      # Auth, RBAC, Tenant isolation
│   │   │   ├── models/          # MongoDB schemas
│   │   │   ├── routes/          # API endpoints
│   │   │   ├── services/        # Business logic
│   │   │   └── tests/           # Unit tests
│   │   ├── scripts/
│   │   │   └── seed.js          # Database seeding
│   │   └── package.json
│   │
│   ├── shell/                    # React host app
│   │   ├── src/
│   │   │   ├── components/      # Layout, Auth components
│   │   │   ├── context/         # Auth context
│   │   │   ├── services/        # API client
│   │   │   └── pages/           # Dashboard, Remote app loader
│   │   └── webpack.config.js    # Module Federation host
│   │
│   └── support-tickets-app/     # Tickets micro-frontend
│       ├── src/
│       │   ├── components/      # Ticket UI components
│       │   ├── hooks/           # useTickets hook
│       │   └── App.jsx
│       └── webpack.config.js    # Module Federation remote
│
├── .gitignore
└── README.md
```

---

##  Key Technologies

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React 18, React Router
- **Module Federation**: Webpack 5
- **Authentication**: JWT, bcrypt
- **API Client**: Axios
- **Containerization**: Docker

---

##  Testing

### Test Tenant Isolation

1. Login as `admin@logisticsco.com`
2. Create a ticket
3. Logout
4. Login as `admin@retailgmbh.com`
5. Verify you DON'T see LogisticsCo's ticket

### Test Real-time Updates

1. Create a ticket
2. Wait 3 seconds (auto-refresh)
3. Ticket list updates automatically

---

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker ps

# Start MongoDB
docker start mongodb
```

### CORS Errors

Make sure all three services are running:

- API on 3001
- Shell on 3000
- Tickets on 3002

---

## 📝 Development Notes

### Adding a New Tenant

1. Add customer to MongoDB:

```javascript
await Customer.create({
  _id: "NewCompany",
  name: "New Company Inc.",
  plan: "pro",
});
```

2. Create admin user:

```javascript
await User.create({
  email: "admin@newcompany.com",
  password: hashedPassword,
  customerId: "NewCompany",
  role: "Admin",
});
```

3. Add to registry:

```json
// packages/api/src/registry.json
{
  "NewCompany": [
    {
      "id": "support-tickets",
      "name": "Support Tickets",
      "url": "http://localhost:3002/remoteEntry.js",
      "scope": "supportTicketsApp",
      "module": "./App"
    }
  ]
}
```

---

##  Contributing

This is a technical challenge project. Not open for contributions.

---

##  License

MIT License - See LICENSE file for details

---

##  Author

Suhani Pandey

- GitHub: https://github.com/suhani-prog
- Email: pandeysuhani30@gmail.com

---

## Acknowledgments

Built as part of a technical challenge to demonstrate:

- Multi-tenant architecture
- Micro-frontend patterns
- Workflow automation
- Modern web development practices
