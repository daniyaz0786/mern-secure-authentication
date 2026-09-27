# 🔐 MERN Secure Authentication System

A production-style **MERN Stack Authentication & Authorization System** built with React.js, Node.js, Express.js, and MongoDB.

This project demonstrates a secure authentication architecture using **JWT Access Tokens, Refresh Tokens, HttpOnly Cookies, Token Rotation, Email Verification, Forgot Password, Password Reset, Role-Based Access Control (RBAC), Protected Routes, and Secure Logout**.

---

## 🚀 Live Project

### Frontend

Coming Soon

### Backend API

Coming Soon

### GitHub Repository

https://github.com/daniyaz0786/mern-secure-authentication

---

## 📌 Project Overview

This application implements a complete authentication workflow for modern web applications.

The system supports:

* User registration
* Email verification
* User login
* JWT-based authentication
* Short-lived access tokens
* Refresh token authentication
* HttpOnly refresh-token cookies
* Refresh token rotation
* Token revocation
* Protected routes
* Role-Based Access Control
* Admin-only dashboard
* User profile
* Forgot password
* Secure password reset
* Password reset token expiration
* Secure logout
* Password hashing
* Request validation
* Security middleware
* API error handling

The main goal of this project is to demonstrate how authentication can be designed using a **secure and scalable MERN architecture**.

---

# 🛠️ Tech Stack

## Frontend

* React.js
* React Router
* Redux Toolkit
* Axios
* React Toastify
* JavaScript ES6+
* HTML5
* CSS3

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Nodemailer
* Cookie Parser
* CORS
* Zod

## Security

* JWT Access Token
* JWT Refresh Token
* HttpOnly Cookies
* SameSite Cookie Protection
* Password Hashing
* Refresh Token Rotation
* Refresh Token Revocation
* Password Reset Token Hashing
* Token Expiration
* Role-Based Authorization
* Protected API Routes
* Request Validation
* Helmet
* Rate Limiting

---

# 🏗️ Project Architecture

```text
mern-auth/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── ProtectedRoutes/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── api/
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── README.md
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   │   └── verifyJWT.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   │
│   ├── validators/
│   │   └── authValidator.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

# 🔐 Authentication Architecture

The application uses a two-token authentication architecture.

```text
                    User Login
                        │
                        ▼
                ┌───────────────┐
                │   Backend     │
                │ Express + JWT │
                └───────┬───────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
      Access Token          Refresh Token
       Short-lived            Long-lived
             │                     │
             ▼                     ▼
      Redux / Memory       HttpOnly Cookie
                                   │
                                   ▼
                              Database
```

### Access Token

The access token is short-lived and used to access protected APIs.

Example:

```text
Expiration: 15 minutes
```

It contains information such as:

```json
{
  "id": "userId",
  "role": "User"
}
```

The access token is stored in application state rather than persistent browser storage.

---

# 🍪 Refresh Token

The refresh token is used to obtain a new access token after the access token expires.

The refresh token is stored inside an:

```text
HttpOnly Cookie
```

This prevents normal JavaScript code from directly accessing the cookie.

Example cookie configuration:

```js
res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
});
```

For local development, `secure` may be disabled when using HTTP.

---

# 🔄 Refresh Token Rotation

Whenever a refresh request is made:

```text
Old Refresh Token
       │
       ▼
Verify Token
       │
       ▼
Validate Token in Database
       │
       ▼
Generate New Access Token
       │
       ▼
Generate New Refresh Token
       │
       ▼
Replace Old Refresh Token
```

The previous refresh token becomes invalid.

This helps reduce the risk of long-lived token reuse.

---

# 🚫 Token Revocation

The application stores the current refresh token in the database.

During refresh:

```text
Cookie Refresh Token
        │
        ▼
Compare with DB Token
        │
   ┌────┴────┐
   │         │
 Match     Mismatch
   │         │
   ▼         ▼
Allow      Reject
```

During logout:

```text
Refresh Token
      │
      ▼
Database Token = null
      │
      ▼
Cookie Cleared
```

This invalidates the refresh-token session.

---

# 👤 User Registration

The registration flow includes:

1. User enters registration details.
2. Backend validates the request.
3. Password is hashed using bcrypt.
4. User account is created.
5. Email verification process is triggered.
6. User verifies their email.
7. User can log in.

Password is never stored as plain text.

Example:

```text
Plain Password
      │
      ▼
    bcrypt
      │
      ▼
Hashed Password
      │
      ▼
    MongoDB
```

---

# ✉️ Email Verification

After registration, the user receives an email verification link.

Example flow:

```text
Register
   ↓
Create User
   ↓
Generate Verification Token
   ↓
Send Email
   ↓
User Opens Link
   ↓
Verify Token
   ↓
Account Verified
```

This helps ensure that the registered email address belongs to the user.

---

# 🔑 Login Flow

```text
User
 │
 ▼
Login Form
 │
 ▼
POST /auth/login
 │
 ▼
Validate Email + Password
 │
 ▼
Compare Password using bcrypt
 │
 ▼
Generate Access Token
 │
 ▼
Generate Refresh Token
 │
 ├──────────────► HttpOnly Cookie
 │
 ▼
Return Access Token + User
 │
 ▼
Store Access Token in Redux
```

---

# 🛡️ Protected Routes

Protected frontend routes prevent unauthenticated users from accessing private pages.

Example:

```jsx
<ProtectedRoute>
    <Profile />
</ProtectedRoute>
```

If the user is authenticated:

```text
Allow Access
```

If the user is not authenticated:

```text
Redirect → Login
```

---

# 👑 Role-Based Access Control

The application supports different user roles.

Example:

```text
User
Admin
```

Admin-only routes are protected using a separate authorization layer.

Example:

```jsx
<ProtectedRoute>
    <AdminRoute>
        <Dashboard />
    </AdminRoute>
</ProtectedRoute>
```

The backend also validates authorization.

Frontend route protection alone is not considered sufficient security.

---

# 👤 User Profile

Authenticated users can access their profile.

The profile displays information such as:

* Name
* Email
* Role
* Account status

Example:

```text
Profile
 ├── Name
 ├── Email
 ├── Role
 └── Account Status
```

---

# 🔄 Session Restoration

When the React application starts, it attempts to restore the user's session.

```text
Application Start
       │
       ▼
Check Refresh Cookie
       │
       ▼
POST /auth/refresh
       │
       ▼
Generate New Access Token
       │
       ▼
Store Token in Redux
       │
       ▼
User Session Restored
```

This allows the application to maintain authentication even when the short-lived access token is no longer available in memory.

---

# 🔐 Forgot Password

The forgot-password workflow is designed so that the API does not reveal whether an email address exists.

Example response:

```text
If the email exists, a reset link has been sent
```

Flow:

```text
Forgot Password
       │
       ▼
Enter Email
       │
       ▼
Generate Random Reset Token
       │
       ▼
Hash Token
       │
       ▼
Store Hash in Database
       │
       ▼
Send Raw Token by Email
```

The raw token is not stored in the database.

---

# 🔑 Password Reset

The password-reset link contains the temporary reset token.

Example:

```text
/reset-password?token=RESET_TOKEN
```

The backend receives the token through the route:

```text
POST /auth/reset-password/:token
```

The token is then hashed and compared against the stored database hash.

```text
Reset Token
     │
     ▼
SHA-256 Hash
     │
     ▼
Compare with Database
     │
     ▼
Check Expiration
     │
     ▼
Reset Password
```

The reset token expires after a limited period.

After successful password reset:

```text
resetPasswordToken = null
resetPasswordExpires = null
refreshToken = null
```

Invalidating the refresh token helps terminate existing authenticated sessions after a password change.

---

# 🚪 Logout

Logout performs server-side session invalidation.

```text
Logout Request
      │
      ▼
Read Refresh Token
      │
      ▼
Find User
      │
      ▼
Remove Refresh Token from DB
      │
      ▼
Clear Cookie
      │
      ▼
Clear Redux Authentication State
      │
      ▼
Redirect to Login
```

---

# 🧪 API Validation

Authentication requests are validated before reaching business logic.

Validation includes:

* Required fields
* Email format
* Password requirements
* Confirm password matching
* Request structure

The project uses **Zod** for schema validation.

Example:

```js
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});
```

---

# 🛡️ Security Features

The project demonstrates several common web-security practices.

### Password Security

* bcrypt password hashing
* Plain-text passwords are not stored

### Token Security

* Short-lived access tokens
* Refresh tokens
* Refresh token rotation
* Refresh token revocation
* Token expiration

### Cookie Security

* HttpOnly
* SameSite
* Secure cookie configuration for production

### Password Reset Security

* Cryptographically random reset tokens
* SHA-256 token hashing before database storage
* Token expiration
* Token invalidation after use

### API Security

* Helmet
* CORS configuration
* Rate limiting
* Request validation
* Authentication middleware
* Authorization middleware

---

# 📡 API Endpoints

## Authentication

| Method   | Endpoint                          | Description               |
| -------- | --------------------------------- | ------------------------- |
| POST     | `/api/auth/register`              | Register new user         |
| POST     | `/api/auth/login`                 | Login user                |
| POST     | `/api/auth/refresh`               | Generate new access token |
| POST     | `/api/auth/logout`                | Logout user               |
| POST     | `/api/auth/forgotPassword`        | Request password reset    |
| POST     | `/api/auth/reset-password/:token` | Reset password            |
| GET/POST | `/api/auth/verify-email`          | Verify email              |

> Exact endpoint names should match the current backend routes.

---

# 👤 User APIs

Example protected user endpoint:

```text
/api/user/profile
```

Authentication is required to access protected user resources.

---

# 👑 Admin APIs

Admin APIs are protected using authentication and role-based authorization.

Example:

```text
/api/admin/...
```

Only users with the required admin role can access admin resources.

---

# 📁 Important Backend Files

### `models/User.js`

Defines the MongoDB user schema.

Contains fields such as:

```text
name
email
password
role
refreshToken
resetPasswordToken
resetPasswordExpires
```

---

### `middleware/verifyJWT.js`

Responsible for validating JWT access tokens before protected API requests are processed.

---

### `utils/generateToken.js`

Contains JWT token-generation logic.

---

### `utils/sendEmail.js`

Responsible for sending emails such as:

* Email verification
* Password reset

---

### `validators/authValidator.js`

Contains request validation schemas for authentication-related operations.

---

# ⚙️ Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

⚠️ **Never commit `.env` to GitHub.**

The project uses `.gitignore` to prevent environment variables and dependencies from being committed.

---

# 💻 Installation

## 1. Clone Repository

```bash
git clone https://github.com/daniyaz0786/mern-secure-authentication.git
```

```bash
cd mern-secure-authentication
```

---

# 📦 Install Frontend Dependencies

```bash
cd client
npm install
```

---

# 📦 Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

---

# ▶️ Run Backend

From the `server` directory:

```bash
npm run dev
```

or, depending on the configured scripts:

```bash
npm start
```

Backend example:

```text
http://localhost:5000
```

---

# ▶️ Run Frontend

From the `client` directory:

```bash
npm start
```

Frontend example:

```text
http://localhost:3000
```

---

# 🔄 Development Workflow

```text
React Frontend
      │
      │ HTTP / Axios
      ▼
Express API
      │
      ├── Authentication
      ├── Authorization
      ├── Validation
      └── Business Logic
      │
      ▼
MongoDB
```

For authenticated requests:

```text
React
 │
 ▼
Access Token
 │
 ▼
Protected API
 │
 ▼
JWT Verification
 │
 ▼
Authorization
 │
 ▼
Controller
 │
 ▼
MongoDB
```

---

# 🧠 Key Concepts Demonstrated

This project was built to practice and demonstrate:

* JWT Authentication
* Access & Refresh Token Architecture
* Refresh Token Rotation
* Token Revocation
* HttpOnly Cookies
* RBAC
* Protected Routes
* Password Hashing
* Email Verification
* Password Reset
* Secure Token Storage
* Request Validation
* REST APIs
* Redux Authentication State
* React Route Protection
* MongoDB & Mongoose
* Express Middleware
* API Security

---

# 📸 Application Screens

Add screenshots here after uploading them to the repository.

Example:

```markdown
## Screenshots

### Login

![Login](./screenshots/login.png)

### Register

![Register](./screenshots/register.png)

### Profile

![Profile](./screenshots/profile.png)

### Admin Dashboard

![Dashboard](./screenshots/dashboard.png)

### Forgot Password

![Forgot Password](./screenshots/forgot-password.png)
```

---

# 🔒 Security Considerations

This project is designed as a production-style authentication implementation for learning and portfolio purposes.

Before deploying to a real production environment, additional considerations should include:

* HTTPS
* Secure cookie configuration
* Strong secret management
* Production CORS configuration
* Environment-specific configuration
* Strong rate limiting
* Monitoring and logging
* Database security
* Email provider security
* CSRF strategy where applicable
* Token/session management at scale

---

# 🚀 Future Improvements

Possible future improvements include:

* Redis-based session/token management
* Multi-device session management
* Device/session listing
* Revoke individual sessions
* Two-factor authentication (2FA)
* OAuth authentication
* Google/GitHub login
* Account lockout policies
* Advanced audit logging
* Email change verification
* Password-change notification
* Docker deployment
* CI/CD pipeline
* AWS deployment

---

# 👨‍💻 Author

**Mohammed Daniyaz Ali**

React.js / MERN Stack Developer

### GitHub

https://github.com/daniyaz0786

### LinkedIn

https://linkedin.com/in/mohammed-daniyaz-alii/

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is created for learning, portfolio, and demonstration purposes.
