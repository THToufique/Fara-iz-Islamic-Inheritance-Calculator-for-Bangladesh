# Fara'iz — Islamic Inheritance Calculator for Bangladesh

A full-stack web platform that calculates Islamic inheritance (Fara'iz) shares for families in Bangladesh, following the Qur'anic framework (4:11–12, 4:176), and supports the property documentation process.

## Project Structure

```
faraiz/
├── client/          # Next.js 14 frontend (Tailwind CSS)
└── server/          # Express.js REST API (MongoDB/Mongoose)
```

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Recharts
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT (JSON Web Tokens) + bcryptjs
- **PDF**: pdfkit

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/faraiz.git
cd faraiz

# 2. Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret

# 3. Install dependencies
cd client && npm install
cd ../server && npm install

# 4. Run development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Frontend runs on http://localhost:3000  
Backend API runs on http://localhost:5000

## Team

- Member 1 (Frontend): Pages, Components, UI
- Member 2 (Backend/API): Express routes, controllers, middleware
- Member 3 (Engine + DB): Fara'iz engine, MongoDB schemas, Auth

## Pages

1. Home/Landing
2. About
3. Calculator Form
4. Results + Chart
5. Heir Rules Explainer
6. Property Document Checklist
7. Land Registration Guide
8. Find a Professional
9. Professional Profile
10. Login / Register
11. User Dashboard
12. FAQ + Glossary
13. Blog / Articles
14. Admin Panel

## Calculation Engine

The Fara'iz engine (`server/src/utils/faraizEngine.js`) covers:
- Surviving spouse (husband or wife/wives)
- Sons and daughters (residuary 2:1 distribution)
- Parents (father and mother fixed shares)

Extended relatives (siblings, grandparents) are flagged as out-of-scope in v1.

## License

Academic project — Northern University Bangladesh, Software Development III
