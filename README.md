# 🚀 MODX - Collaborative Project Management Platform

<div align="center">

![MODX Banner](https://img.shields.io/badge/MODX-Project%20Collaboration-orange?style=for-the-badge)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-v18+-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.1-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

**A modern, AI-powered platform for connecting developers, managing projects, and building teams.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**MODX** is a comprehensive project collaboration platform designed to connect developers, facilitate team formation, and streamline project management. Built with modern web technologies and powered by AI, MODX provides an intelligent ecosystem for developers to discover projects, collaborate with peers, and bring ideas to life.

### Key Highlights

- 🤖 **AI-Powered Recommendations** - Smart project and team member suggestions using Google Gemini AI
- 💬 **Real-time Communication** - Instant messaging with Socket.IO for seamless collaboration
- 📊 **Project Analytics** - Track project progress, team performance, and engagement metrics
- 🎨 **Modern UI/UX** - Beautiful, responsive interface built with React and Framer Motion
- 🔒 **Secure Authentication** - JWT-based auth with email verification
- ☁️ **Cloud Storage** - Cloudinary integration for profile images and resume uploads

---

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Registration & Login** - JWT-based authentication with HTTP-only cookies
- **Email Verification** - Nodemailer integration for account verification
- **Profile Management** - Upload profile pictures and resumes to Cloudinary
- **Interest-Based Profiles** - Tag your skills and interests for better matching

### 🚀 Project Management
- **Create & Manage Projects** - Full CRUD operations for project lifecycle
- **Team Formation** - Invite members, manage roles, and track participation
- **Project Discovery** - Browse and filter projects by technology, skills, and timeline
- **AI-Powered Matching** - Get personalized project recommendations based on your profile

### 💬 Real-time Communication
- **Instant Messaging** - Real-time chat powered by Socket.IO
- **Project Discussions** - Dedicated chat rooms for each project
- **Notifications** - Live updates for project invitations and messages
- **Online Status** - See who's currently active on the platform

### 🤖 AI Integration
- **Smart Recommendations** - AI-powered project and user suggestions
- **Vector Search** - Semantic search using FAISS for intelligent matching
- **Profile Analysis** - AI analyzes user profiles for optimal team composition
- **Content Indexing** - Automatic indexing of projects and users for better discovery

### 📊 Analytics & Insights
- **Project Metrics** - Track project progress and team engagement
- **User Statistics** - View your contributions and collaboration history
- **Dashboard** - Comprehensive overview of your projects and activities

---

## 🛠 Tech Stack

### Frontend
- **React 19.1** - Modern UI library with latest features
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS 4.1** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM** - Client-side routing
- **Socket.IO Client** - Real-time WebSocket communication
- **Axios** - HTTP client for API requests
- **React Query** - Server state management
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js & Express 5.1** - Fast, unopinionated web framework
- **MongoDB & Mongoose** - NoSQL database with ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service integration
- **Cloudinary** - Cloud-based media management
- **gRPC** - High-performance RPC framework for AI service communication

### AI Service
- **Python 3.x** - AI service runtime
- **Google Gemini AI** - Advanced language model for recommendations
- **FAISS** - Vector similarity search for semantic matching
- **Flask/FastAPI** - Python web framework for AI endpoints
- **gRPC** - Communication with backend services

### DevOps & Tools
- **Git** - Version control
- **dotenv** - Environment variable management
- **ESLint** - Code linting and quality
- **Nodemon** - Auto-restart development server

---

## 🏗 Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Vite + TailwindCSS]
    end
    
    subgraph "API Layer"
        B[Express Backend<br/>REST API]
        C[Socket.IO Server<br/>WebSocket]
    end
    
    subgraph "AI Layer"
        D[Python AI Service<br/>gRPC Server]
        E[Google Gemini AI]
        F[FAISS Vector DB]
    end
    
    subgraph "Data Layer"
        G[(MongoDB<br/>User & Project Data)]
        H[Cloudinary<br/>Media Storage]
    end
    
    A -->|HTTP/REST| B
    A -->|WebSocket| C
    B -->|gRPC| D
    D -->|API Calls| E
    D -->|Vector Search| F
    B -->|Mongoose| G
    B -->|Upload API| H
    C -->|Real-time Events| A
```

### System Components

1. **Frontend (React + Vite)**
   - Single Page Application (SPA)
   - Component-based architecture
   - Real-time updates via Socket.IO
   - Responsive design with TailwindCSS

2. **Backend (Node.js + Express)**
   - RESTful API endpoints
   - JWT authentication middleware
   - Socket.IO integration for real-time features
   - gRPC client for AI service communication

3. **AI Service (Python)**
   - gRPC server for high-performance communication
   - Google Gemini AI integration
   - FAISS vector database for semantic search
   - Automatic indexing of users and projects

4. **Database (MongoDB)**
   - User profiles and authentication
   - Project data and metadata
   - Team memberships and roles
   - Message history

5. **Cloud Storage (Cloudinary)**
   - Profile images
   - Resume/CV uploads
   - Project thumbnails

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.8
- **MongoDB** (local or Atlas)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Srujan253/modx-second.git
   cd modx-second
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd MODXX
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Install AI Service Dependencies**
   ```bash
   cd ../ai-service
   pip install -r requirements.txt
   ```

5. **Set up Environment Variables**
   
   Create `.env` files in each directory (see [Environment Variables](#-environment-variables))

6. **Start the Services**

   **Terminal 1 - Frontend:**
   ```bash
   cd MODXX
   npm run dev
   ```

   **Terminal 2 - Backend:**
   ```bash
   cd backend
   npm start
   # or for development with auto-reload:
   nodemon server.js
   ```

   **Terminal 3 - AI Service:**
   ```bash
   cd ai-service
   python main.py
   ```

7. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - AI Service: `localhost:50051` (gRPC)

---

## 🔐 Environment Variables

### Frontend (`MODXX/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (`backend/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/modx
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/modx

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Email Service (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Service
PYTHON_AI_SERVICE_URL=localhost:50051
```

### AI Service (`ai-service/.env`)
```env
# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# gRPC Server
GRPC_PORT=50051

# Vector Database
FAISS_INDEX_PATH=./data/faiss_index
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/verify-email/:token` | Verify email |
| POST | `/api/v1/auth/forgot-password` | Request password reset |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PATCH | `/api/v1/users/me` | Update user profile |
| GET | `/api/v1/users/:id` | Get user by ID |
| GET | `/api/v1/users/search` | Search users |

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/project` | Get all projects |
| POST | `/api/v1/project` | Create new project |
| GET | `/api/v1/project/:id` | Get project by ID |
| PATCH | `/api/v1/project/:id` | Update project |
| DELETE | `/api/v1/project/:id` | Delete project |
| GET | `/api/v1/project/user-projects` | Get user's projects |
| GET | `/api/v1/project/recommendations` | Get AI recommendations |

### Team Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/project/:id/invite` | Invite user to project |
| PATCH | `/api/v1/project/:id/members/:userId` | Update member role |
| DELETE | `/api/v1/project/:id/members/:userId` | Remove member |

---

## 📁 Project Structure

```
modx-second/
├── MODXX/                      # Frontend React Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/           # React Context providers
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── .env                   # Frontend environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                    # Node.js Backend
│   ├── config/                # Configuration files
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── controller/            # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── projectController.js
│   ├── models/                # Mongoose models
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── ProjectMember.js
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   │   └── uploadToCloudinary.js
│   ├── socketHandlers.js      # Socket.IO event handlers
│   ├── server.js              # Express server entry
│   ├── .env                   # Backend environment variables
│   └── package.json
│
├── ai-service/                 # Python AI Service
│   ├── core/                  # Core AI logic
│   │   └── llm_service.py     # Gemini AI integration
│   ├── services/              # Service modules
│   │   └── vector_indexer.py  # FAISS indexing
│   ├── proto/                 # gRPC protocol buffers
│   ├── main.py                # gRPC server entry
│   ├── .env                   # AI service environment variables
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Style

- **Frontend**: Follow React best practices, use functional components and hooks
- **Backend**: Use async/await, proper error handling, and meaningful variable names
- **Python**: Follow PEP 8 style guide

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**MODX** is developed and maintained by passionate developers committed to building better collaboration tools.

- **Lead Developer**: [Srujan H M](https://github.com/Srujan253)

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering our AI recommendations
- [Cloudinary](https://cloudinary.com/) for media management
- [MongoDB](https://www.mongodb.com/) for database solutions
- All our contributors and users!

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Srujan253/modx-second/issues)
- **Email**: srujanhm135@gmail.com
- **LinkedIn**: [Srujan H M](https://www.linkedin.com/in/srujan-h-m-a51940321/)

---

<div align="center">

**Made with ❤️ by the MODX Team**

⭐ Star us on GitHub if you find this project useful!

</div>
