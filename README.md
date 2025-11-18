# KreupAI.ManithPro - Recruitment Portal

A comprehensive, full-stack recruitment portal built with modern technologies to streamline the hiring process.

## Features

### For Recruiters
- 📝 Post and manage job openings
- 👥 View and filter candidate applications
- 📊 Dashboard with recruitment analytics
- ✅ Update application status
- 📅 Schedule interviews
- 🔍 Search and filter candidates

### For Candidates
- 🔎 Browse available job listings
- 📄 Apply with resume upload
- 📍 Track application status
- 👤 Manage personal profile
- 📧 Receive email notifications

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

```
KreupAI.ManithPro/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── uploads/            # Uploaded resumes
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KreupAI.ManithPro
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/recruitment_db"
   JWT_SECRET="your-secret-key-here"
   PORT=5000
   FRONTEND_URL="http://localhost:5173"

   # Email configuration (optional)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

6. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List all jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (recruiter only)
- `PUT /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)

### Applications
- `GET /api/applications` - List applications
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Submit application
- `PUT /api/applications/:id/status` - Update status (recruiter only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Default User Roles

- **CANDIDATE**: Can browse jobs and submit applications
- **RECRUITER**: Can post jobs and manage applications
- **ADMIN**: Full system access

## Database Schema

### User
- id, email, password, firstName, lastName, role, phone, createdAt, updatedAt

### Job
- id, title, description, location, type, salary, requirements, status, postedBy, createdAt, updatedAt

### Application
- id, jobId, candidateId, resume, coverLetter, status, appliedAt, updatedAt

## Development

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Run database migrations
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- File upload restrictions
- CORS configuration

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ by KreupAI Technologies
