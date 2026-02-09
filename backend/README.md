<<<<<<< HEAD
# CondoCare System - Backend API

A Node.js/Express backend for the CondoCare condominium management system with MongoDB database, JWT authentication, and role-based access control.

## Features

- **User Authentication**: Register and login with JWT tokens and bcrypt password hashing
- **Role-Based Access Control**: Three user roles (admin, tech, resident) with different permissions
- **Report Management**: Create, read, update, delete maintenance reports
- **Comment System**: Add comments to reports for feedback
- **Statistics**: Get comprehensive report statistics (completed, in-progress, waiting)
- **User Management**: CRUD operations for user accounts

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 7.0.0
- **Authentication**: JWT (jsonwebtoken 9.0.0)
- **Security**: bcryptjs 2.4.3 for password hashing
- **CORS**: Cross-Origin Resource Sharing enabled
- **Environment**: dotenv for configuration management

## Project Structure

```
backend/
├── package.json                 # Dependencies and scripts
├── server.js                    # Main server entry point
├── .env.example                 # Environment variables template
├── config/
│   └── env.js                  # Environment configuration
├── models/
│   ├── User.js                 # User schema (admin, tech, resident)
│   └── Report.js               # Report schema with comments
├── middleware/
│   └── auth.js                 # JWT and role-based authorization
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── reportController.js     # Report management logic
│   └── userController.js       # User management logic
└── routes/
    ├── auth.js                 # Authentication endpoints
    ├── report.js               # Report endpoints
    └── user.js                 # User endpoints
```

## Installation & Setup

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn package manager

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# MONGO_URI: Your MongoDB connection string
# JWT_SECRET: Your secret key for JWT tokens
# PORT: Server port (default: 3001)
```

### 4. Start the Server

**Development (with auto-reload)**:
```bash
npm run dev
```

**Production**:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
  ```json
  {
    "username": "john123",
    "password": "secure123",
    "name": "John Doe",
    "role": "resident",
    "email": "john@example.com",
    "phone": "0812345678"
  }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  {
    "username": "john123",
    "password": "secure123"
  }
  ```
  Response: `{ token: "jwt_token_here", user: {...} }`

### Reports
- **GET** `/api/reports` - Get all reports
- **GET** `/api/reports/statistics` - Get report statistics
- **GET** `/api/reports/user/:username` - Get user's reports
- **POST** `/api/reports` - Create new report (auth required)
- **PUT** `/api/reports/:id/status` - Update report status (admin/tech only)
- **PUT** `/api/reports/:id/feedback` - Add feedback to report (admin/tech only)
- **POST** `/api/reports/:id/comment` - Add comment to report (auth required)
- **DELETE** `/api/reports/:id` - Delete report (auth required)

### Users
- **GET** `/api/users` - Get all users (admin only)
- **GET** `/api/users/:id` - Get user by ID (auth required)
- **PUT** `/api/users/:id` - Update user info (auth required)
- **DELETE** `/api/users/:id` - Delete user (admin only)

## User Roles & Permissions

| Role | Can | Restrictions |
|------|-----|--------------|
| **Admin** | View all users, manage reports, create tech, approve reports | Full access |
| **Tech** | Submit reports, manage reports, add comments | Can't delete other reports |
| **Resident** | Submit reports, add comments, view own reports | Can't access admin features |

## Request Headers

All protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

## Database Schemas

### User
```javascript
{
  username: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  email: String,
  phone: String,
  role: String ('admin', 'tech', 'resident'),
  createdAt: Date
}
```

### Report
```javascript
{
  reportId: String (unique),
  category: String ('ไฟฟ้า', 'ประปา', 'ลิฟต์', 'อื่นๆ'),
  detail: String,
  owner: String,
  status: String ('waiting', 'in-progress', 'done'),
  feedback: String,
  comments: [{
    author: String,
    text: String,
    timestamp: Date
  }],
  createdAt: Date
}
```

## Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","name":"Test User","role":"resident"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get Reports (with token)
curl -X GET http://localhost:3001/api/reports \
  -H "Authorization: Bearer <token_from_login>"
```

### Using Postman
1. Import API endpoints into Postman
2. Get JWT token from login endpoint
3. Add token to Authorization tab (Bearer Token)
4. Test other endpoints

## Environment Variables

Create `.env` file with:

```
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/condocare
JWT_SECRET=your_secret_key_minimum_32_characters_recommended
JWT_EXPIRE=7d
```

## Error Handling

All endpoints return error responses in format:
```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT tokens with expiration
- Role-based access control (RBAC)
- CORS protection
- Input validation on all endpoints
- Secure password comparison

## Development Notes

- Use `npm run dev` during development for auto-reload
- MongoDB should be running before starting the server
- Check console logs for connection status
- JWT tokens expire after 7 days by default

## Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Generate strong JWT_SECRET
- [ ] Configure MongoDB Atlas with IP whitelist
- [ ] Set proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up environment variables on server
- [ ] Add rate limiting middleware
- [ ] Configure logging
- [ ] Setup monitoring/alerting

## Support & Debugging

If the server won't start:
1. Check MongoDB is running: `mongosh` or MongoDB Compass
2. Verify `.env` file exists and has correct values
3. Check if port 3001 is already in use: `netstat -ano | find ":3001"`
4. View console logs for error messages

## License

CondoCare System Backend - All Rights Reserved
=======
"# coco" 
>>>>>>> 2fd39b95bee3f811c11b9c578087193197db87d1
"# coco" 
"# coco" 
