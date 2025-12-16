# Registration Integration Guide

## Overview
The registration functionality is fully integrated between the frontend and backend. This guide explains the integration and how to test it.

## Architecture

### Frontend Components

#### 1. Register Component (`frontend/src/pages/Register.tsx`)
- Full registration form with validation
- Fields: firstName, lastName, email, password, confirmPassword, role, phone, location
- Client-side validation for all fields
- Real-time validation error display
- Loading states and error handling

#### 2. Auth Context (`frontend/src/context/AuthContext.tsx`)
- Provides `register` function to components
- Manages user state and token storage
- Automatically stores token in localStorage
- Handles authentication state across the app

#### 3. API Service (`frontend/src/services/api.ts`)
- API endpoint: `POST /api/auth/register`
- Axios instance with interceptors
- Automatic token attachment to requests
- Error handling and 401 redirect

### Backend Components

#### 1. Auth Controller (`backend/src/controllers/auth.controller.ts`)
- `register` endpoint handler
- Validates required fields
- Checks for existing users
- Password hashing with bcrypt
- JWT token generation
- Returns user data and token

#### 2. Auth Routes (`backend/src/routes/auth.routes.ts`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (authenticated)

#### 3. Server Configuration (`backend/src/index.ts`)
- CORS enabled for frontend URL
- JSON and URL-encoded body parsing
- Routes mounted at `/api/auth`

## Environment Configuration

### Frontend (`.env.development`)
```env
VITE_API_URL=http://localhost:5001/api
```

### Backend (`.env.development`)
```env
PORT=5001
DATABASE_URL=postgresql://...
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

## Data Flow

1. **User Submits Form**
   - User fills out registration form
   - Client-side validation runs
   - Form data is sent to AuthContext's `register` method

2. **API Request**
   - AuthContext calls `authAPI.register(data)`
   - Axios sends POST request to `http://localhost:5001/api/auth/register`
   - Request includes: `{ email, password, firstName, lastName, role, phone, location }`

3. **Backend Processing**
   - Express routes to auth.controller.register
   - Validates required fields
   - Checks if email already exists
   - Hashes password with bcrypt
   - Creates user in database via Prisma
   - Generates JWT token

4. **Response Handling**
   - Backend returns: `{ message, user, token }`
   - Frontend stores token in localStorage
   - User state is updated in AuthContext
   - User is redirected to dashboard

## Validation Rules

### Client-Side (Frontend)
- **Email**: Valid email format (regex validation)
- **Password**: Minimum 8 characters
- **Confirm Password**: Must match password
- **First Name**: Minimum 2 characters
- **Last Name**: Minimum 2 characters
- **Phone**: Valid phone format (optional)
- **Role**: One of CANDIDATE, RECRUITER, B2B

### Server-Side (Backend)
- **Required Fields**: email, password, firstName, lastName
- **Unique Email**: Checks database for existing users
- **Password Hashing**: bcrypt with salt rounds = 10

## Testing the Integration

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Expected output: `🚀 Server running on port 5001`

### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Expected output: Server running on `http://localhost:5173`

### 3. Test Registration Flow

#### A. Navigate to Registration Page
- Open browser to `http://localhost:5173/register`
- Verify form is displayed correctly

#### B. Test Client-Side Validation
1. Try submitting empty form → Should show validation errors
2. Enter invalid email → Should show "Please enter a valid email address"
3. Enter short password → Should show "Password must be at least 8 characters long"
4. Enter mismatched passwords → Should show "Passwords do not match"
5. Enter short names → Should show validation errors

#### C. Test Successful Registration
1. Fill out form with valid data:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: SecurePass123
   - Confirm Password: SecurePass123
   - Role: CANDIDATE
   - Phone: +1234567890 (optional)
   - Location: New York (optional)

2. Click "Create Account"
3. Verify loading state appears
4. Check that user is redirected to `/dashboard`
5. Verify token is stored in localStorage
6. Verify user data is in application state

#### D. Test Error Handling
1. Try registering with the same email again
2. Should show: "Email already registered"

### 4. Verify Backend Logs
Check terminal running backend for:
```
Registration successful for: john.doe@example.com
```

### 5. Verify Database
Check database for new user record:
```sql
SELECT * FROM "User" WHERE email = 'john.doe@example.com';
```

## API Response Examples

### Successful Registration
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CANDIDATE",
    "phone": "+1234567890",
    "location": "New York",
    "createdAt": "2025-12-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Email Already Exists
```json
{
  "error": "Email already registered"
}
```

### Missing Required Fields
```json
{
  "error": "Missing required fields"
}
```

## Troubleshooting

### Issue: CORS Error
**Symptom**: Browser console shows CORS policy error
**Solution**:
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Ensure backend CORS middleware is properly configured

### Issue: 401 Unauthorized
**Symptom**: Token not being sent with requests
**Solution**:
- Check that token is stored in localStorage
- Verify axios interceptor is attaching token to headers

### Issue: Connection Refused
**Symptom**: Cannot connect to backend
**Solution**:
- Verify backend server is running on port 5001
- Check `VITE_API_URL` in frontend `.env`
- Ensure no firewall blocking connections

### Issue: Database Error
**Symptom**: 500 error on registration
**Solution**:
- Verify `DATABASE_URL` is correct
- Run Prisma migrations: `npx prisma migrate dev`
- Check database is running

## Security Considerations

1. **Password Storage**: Passwords are hashed with bcrypt before storage
2. **JWT Tokens**: Tokens contain user ID, email, and role
3. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
4. **CORS**: Restricted to specific frontend URL
5. **Input Validation**: Both client and server-side validation

## Next Steps

After successful integration testing:
1. ✅ Add email verification flow
2. ✅ Implement password strength meter
3. ✅ Add reCAPTCHA protection
4. ✅ Implement rate limiting
5. ✅ Add OAuth social login options
6. ✅ Set up email notifications

## File Checklist

### Frontend Files
- ✅ `frontend/src/pages/Register.tsx` - Registration form component
- ✅ `frontend/src/context/AuthContext.tsx` - Authentication context
- ✅ `frontend/src/services/api.ts` - API service with register endpoint
- ✅ `frontend/.env.development` - Environment configuration

### Backend Files
- ✅ `backend/src/controllers/auth.controller.ts` - Registration controller
- ✅ `backend/src/routes/auth.routes.ts` - Auth routes
- ✅ `backend/src/index.ts` - Express server configuration
- ✅ `backend/.env.development` - Environment configuration
- ✅ `backend/prisma/schema.prisma` - Database schema

## Status: ✅ FULLY INTEGRATED

The registration feature is completely integrated and ready for testing. All components are connected and communicating properly between frontend and backend.
