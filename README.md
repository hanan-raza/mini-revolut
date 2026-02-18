# 🚀 Mini Revolut – Wallet & Peer-to-Peer Transfer System

A simplified fintech wallet application inspired by Revolut.

Users can:
- Register and Login
- Deposit money
- Withdraw money
- Transfer money to other users
- View transaction history

Built using React, Express, and MongoDB.

---

# 🧱 Tech Stack

## Frontend
- React (Vite)
- Axios

## Backend
- Node.js
- Express
- JWT Authentication
- Helmet
- Rate Limiting
- CORS

## Database
- MongoDB (Mongoose)

---

# 🏗 System Architecture Explanation

High-level architecture:

Client (React)  
↓  
Express API Server  
↓  
MongoDB Database  

### Client Layer
Handles user interface and sends API requests to backend.

### API Layer
- Validates input
- Authenticates users with JWT
- Applies security middleware
- Calls service logic

### Service Layer
Contains business logic:
- Deposit
- Withdraw
- Transfer
- Transaction recording

### Database Layer
Stores:
- Users
- Wallet balances
- Transactions (ledger system)

---

# 🗄 Database Schema Design

## User Schema

- _id
- name
- email (unique, indexed)
- password (hashed)
- balance
- createdAt
- updatedAt

## Transaction Schema

- _id
- type (DEPOSIT | WITHDRAW | TRANSFER)
- amount
- fromUser
- toUser
- status
- createdAt

Indexes should be added on:
- email
- fromUser
- toUser
- createdAt

---

# 📈 How to Scale to 1 Million Users

## Backend Scaling
- Deploy multiple API instances
- Use load balancer
- Keep API stateless using JWT

## Database Scaling
- Use MongoDB Atlas cluster
- Add indexes
- Use sharding for large transaction collections

## Caching
- Add Redis for caching frequently accessed data

## Background Workers
- Email notifications
- Fraud detection
- Logging & analytics

## Idempotency
- Use idempotency keys for safe retries


---

# 🔐 Real Banking-Grade Security

- Short-lived JWT tokens
- Refresh token rotation
- Password hashing (bcrypt)
- Rate limiting
- Input validation
- HTTPS only
- Encrypt sensitive data
- Use secrets manager
- Audit logs for all transactions
- Transfer limits and fraud detection

---

# 🏭 Production Readiness Improvements

- Unit and integration tests
- CI/CD pipeline
- Monitoring and logging
- API versioning
- Docker containerization
- Database backups
- Disaster recovery plan

---

# ⚙️ Setup Instructions

## Clone

git clone https://github.com/hanan-raza/mini-revolut.git
cd mini-revolut

## Server

cd server
cp .env.example .env
npm install
npm run dev

## Client

cd client
cp .env.example .env
npm install
npm run dev

---

# 🌍 Environment Variables

## server/.env

PORT=4000
MONGO_URI=mongodb://localhost:27017/mini_revolut
JWT_SECRET=your_super_secret_key_here
CLIENT_ORIGIN=http://localhost:5173

## client/.env

VITE_API_URL=http://localhost:4000

