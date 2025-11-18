# KreupAI Recruitment Portal - Setup Guide

This comprehensive guide will help you set up and run the KreupAI Recruitment Portal on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Git** (for version control)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd KreupAI.ManithPro
```

## Step 2: Database Setup

### 2.1 Install PostgreSQL

If you haven't installed PostgreSQL yet:

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**On macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**On Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2.2 Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE recruitment_db;

# Create user (optional, or use existing postgres user)
CREATE USER recruitment_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE recruitment_db TO recruitment_user;

# Exit
\q
```

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```bash
cd backend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://recruitment_user:your_password@localhost:5432/recruitment_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Frontend
FRONTEND_URL="http://localhost:5173"

# Email (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@kreupai.com"
```

**Note for Gmail SMTP:**
- Use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
- Enable 2-factor authentication on your Google account
- Generate an app-specific password for the application

### 3.4 Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 3.5 Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm run build
npm start
```

The backend server should now be running on `http://localhost:5000`

## Step 4: Frontend Setup

### 4.1 Open New Terminal and Navigate to Frontend

```bash
cd frontend
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Configure Environment Variables (Optional)

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit if needed (default should work):

```env
VITE_API_URL=http://localhost:5000/api
```

### 4.4 Start Frontend Development Server

```bash
npm run dev
```

The frontend application should now be running on `http://localhost:5173`

## Step 5: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## Step 6: Create Your First User

1. Click on **Register**
2. Fill in the registration form
3. Choose your role:
   - **Candidate**: For job seekers
   - **Recruiter**: For employers posting jobs
4. Click **Register**

You'll be automatically logged in and redirected to the dashboard!

## Testing the Application

### Create a Recruiter Account

1. Register as a **Recruiter**
2. Go to Dashboard
3. Click **Post New Job**
4. Fill in job details
5. Submit the job posting

### Create a Candidate Account

1. Register as a **Candidate** (or use incognito mode)
2. Browse available jobs
3. Click on a job to view details
4. Apply with your resume
5. Track your application status

## Common Issues and Solutions

### Database Connection Error

```
Error: P1001: Can't reach database server
```

**Solution:**
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check your `DATABASE_URL` in `.env`
- Verify database credentials

### Port Already in Use

```
Error: Port 5000 is already in use
```

**Solution:**
- Change the PORT in `backend/.env`
- Or stop the process using the port: `lsof -ti:5000 | xargs kill -9`

### File Upload Errors

**Solution:**
- Ensure the `backend/uploads` directory exists
- Check file permissions: `chmod 755 backend/uploads`

### Email Not Sending

**Solution:**
- Email is optional for development
- Check SMTP credentials in `.env`
- For Gmail, use an App Password
- Check console logs for email errors

## Development Tools

### Prisma Studio

View and edit your database visually:

```bash
cd backend
npx prisma studio
```

This opens a web interface at `http://localhost:5555`

### API Testing

Use tools like:
- **Postman** - [Download](https://www.postman.com/downloads/)
- **Insomnia** - [Download](https://insomnia.rest/download)
- **Thunder Client** (VS Code extension)

### Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npx prisma studio   # Open database GUI
npx prisma migrate  # Run migrations

# Frontend
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Project Structure

```
KreupAI.ManithPro/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── uploads/            # Uploaded files
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── types/         # TypeScript types
│   └── public/            # Static files
└── README.md
```

## Next Steps

1. **Customize Branding**: Update colors, logo, and company name
2. **Add More Features**: Interview scheduling, video calls, assessments
3. **Deploy to Production**: Use services like Vercel, Netlify, Heroku, or AWS
4. **Set Up CI/CD**: Automate testing and deployment
5. **Add Analytics**: Track user behavior and application metrics

## Support

If you encounter any issues:

1. Check this guide thoroughly
2. Review error messages in the console
3. Check the GitHub issues page
4. Contact support at support@kreupai.com

## Security Notes

- **NEVER** commit `.env` files to version control
- Change the `JWT_SECRET` in production
- Use HTTPS in production
- Regularly update dependencies
- Implement rate limiting for production
- Use strong passwords for database users

---

**Happy Recruiting!** 🎉

For more information, visit the [README.md](./README.md)
