# Global_Connect - Professional Networking Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

A comprehensive full-stack MERN (MongoDB, Express.js, React, Node.js) application designed to revolutionize professional networking by integrating real-time communication capabilities, dynamic content feeds, and robust administrative tools.

## 🌟 Overview

Global_Connect addresses critical limitations of existing networking platforms by focusing on active engagement, facilitating collaboration, instant messaging, and dynamic content sharing among job seekers, established professionals, and organizations. The platform aims to foster genuine professional connections, facilitate career advancement, and create a global ecosystem for professional growth and opportunity discovery.

## 🎯 Key Features

- **Comprehensive Networking Infrastructure**: Advanced user discovery with intelligent search and filtering
- **Real-Time Communication**: Instant messaging with WebSocket technology
- **Dynamic Content Platform**: Interactive activity feed with multimedia support
- **Career Development Tools**: Job board with advanced matching algorithms
- **Secure Authentication**: JWT-based security with role-based access control
- **Administrative Dashboard**: Content moderation and user management tools

## 🌐 Live Demo

- **Frontend:** [https://net-global-connect.netlify.app/](https://net-global-connect.netlify.app/)  
- **Backend API:** [https://netglobalconnect.onrender.com](https://netglobalconnect.onrender.com)
- **API Documentation:** [https://documenter.getpostman.com/view/30794754/2sB3QDvYTE](https://documenter.getpostman.com/view/30794754/2sB3QDvYTE)

## 🏗️ System Architecture

```
Frontend (React.js) → API Gateway (Express.js) → Backend Services (Node.js) → Database (MongoDB)
                                ↓
                    Real-time Communication (Socket.io)
```

## 🛠️ Tech Stack

### Frontend
- **React.js (18.x)** - Component-based UI development
- **Tailwind CSS (3.x)** - Utility-first CSS framework
- **Chart.js (4.x)** - Data visualization
- **React Router Dom (6.x)** - Client-side routing

### Backend
- **Node.js (18.x LTS)** - JavaScript runtime
- **Express.js (4.x)** - Web application framework
- **JSON Web Tokens (JWT)** - Authentication & authorization
- **bcryptjs** - Password hashing

### Database
- **MongoDB (6.x)** - NoSQL document database
- **Mongoose (7.x)** - Object Document Mapping

### Real-Time Features
- **Socket.io (4.x)** - Real-time bidirectional communication
- **WebSocket Protocol** - Low latency communication

### Security
- **Helmet.js** - Security middleware
- **bcryptjs** - Password encryption
- **JWT** - Secure token-based authentication

## 🚀 Getting Started

### Prerequisites

- Node.js (18.x or higher)
- MongoDB (6.x or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TejasriM07/NetGlobalConnect.git
   cd NetGlobalConnect
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/globalconnect
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

5. **Start the Development Servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: `https://net-global-connect.netlify.app`
   - Backend API: `https://netglobalconnect.onrender.com`

## 📂 Project Structure

```
NetGlobalConnect/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React Context API
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # CSS and styling files
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── server/                  # Node.js backend application
│   ├── controllers/         # Request handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── package.json        # Backend dependencies
└── README.md               # Project documentation
```

## 🔧 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run test         # Run tests
```

## 🎭 Target Audience

- **Job Seekers & Students**: Access to opportunities, mentorship, and skill development
- **Established Professionals**: Networking opportunities and knowledge sharing
- **Organizations & Recruiters**: Efficient talent acquisition and employer branding

## 📈 Development Timeline

| Week | Sprint Focus | Key Deliverables |
|------|-------------|------------------|
| 1 | Foundation & Planning | Development setup, architecture design |
| 2 | Authentication & User Management | Registration, login, profile management |
| 3 | Networking & Discovery | User search, connections, recommendations |
| 4 | Content & Engagement | Activity feed, posts, real-time interactions |
| 5 | Jobs & Communication | Job board, messaging, notifications |
| 6 | Testing & Deployment | Bug fixes, optimization, documentation |

## 👥 Team

| Role | Name | Responsibilities |
|------|------|-----------------|
| Frontend Specialist | Prajwal | React.js architecture, UI/UX design |
| Backend Specialist | Divyanshu | Node.js/Express.js, API development |
| DevOps Engineer | Nikhil | Deployment, CI/CD, monitoring |
| Authentication | Shivakumar | JWT/OAuth, security implementation |
| QA & Testing | Lakshay | Testing strategy, quality assurance |
| Documentation | Tejasri M | Technical documentation, project coordination |

## 🧪 Testing

The project follows comprehensive testing practices:

- **Unit Testing**: Jest and React Testing Library
- **Integration Testing**: API endpoint validation
- **End-to-End Testing**: Complete user workflow validation
- **Security Testing**: Regular vulnerability assessments

Target: 90%+ test coverage

## 🔒 Security Features

- End-to-end encryption
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Security headers with Helmet.js

## 📊 Performance Targets

- **Load Time**: Sub-3-second page loads
- **API Response**: 200ms average response time
- **Scalability**: Support for 10,000+ concurrent users
- **Uptime**: 99.5%+ availability target
- **WebSocket Latency**: 100ms message delivery

## 🌍 Future Enhancements

- **Phase 2 Features**:
  - AI-powered recommendations
  - Advanced analytics dashboard
  - Native mobile applications
  - Multi-language support
  - Blockchain-based verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the [documentation](docs/) folder

## 🙏 Acknowledgments

- React.js and Node.js communities
- MongoDB and Express.js documentation
- Socket.io for real-time communication
- Tailwind CSS for styling framework
- All team members and contributors

---

**Built with ❤️ by the Global_Connect Team**
