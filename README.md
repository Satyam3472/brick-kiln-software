# 🧱 Brick Kiln Management System

A comprehensive web-based management system for brick kiln operations with role-based authentication and authorization.

## 📋 Overview

This is **Feature 1** of the Brick Kiln Management System - a complete Authentication & Authorization module built with modern web technologies.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT-based Auth
- **UI**: TailwindCSS + shadcn/ui
- **Password Hashing**: bcrypt
- **Validation**: Zod

## ✨ Features

### Authentication
- ✅ Secure login with email or phone number
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ HTTP-only cookie sessions
- ✅ Logout functionality

### Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Three user roles: Admin, Manager, Staff
- ✅ Protected routes (frontend + backend)
- ✅ Automatic redirection based on roles
- ✅ Unauthorized access handling

### User Management (Admin Only)
- ✅ Create new users
- ✅ View all users
- ✅ Edit user details
- ✅ Delete users
- ✅ Field validation
- ✅ Unique email and phone constraints

### User Roles & Permissions

| Role    | Dashboard Access | User Management | Future Modules |
|---------|-----------------|-----------------|----------------|
| Admin   | ✅ Full Access  | ✅ Full Control | ✅ All Modules |
| Manager | ✅ Manager View | ❌ No Access    | ✅ Sales, Expenses, Reports |
| Staff   | ✅ Staff View   | ❌ No Access    | ✅ Data Entry Only |

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brick_kiln_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed database with default users
npm run prisma:seed
```

Or run all at once:

```bash
npm run setup
```

### Step 4: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔐 Default Login Credentials

After seeding the database, you can log in with:

### Admin Account
- **Email**: `admin@brickiln.com`
- **Password**: `Admin@123`
- **Access**: Full system access

### Manager Account
- **Email**: `manager@brickiln.com`
- **Password**: `Manager@123`
- **Access**: Sales, Expenses, Reports (coming soon)

### Staff Account
- **Email**: `staff@brickiln.com`
- **Password**: `Staff@123`
- **Access**: Data entry only (coming soon)

## 🗂️ Project Structure

```
brick-kiln-software/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Login endpoint
│   │   │   ├── logout/route.ts      # Logout endpoint
│   │   │   └── me/route.ts          # Get current user
│   │   └── users/
│   │       ├── route.ts             # List/Create users
│   │       └── [id]/route.ts        # Get/Update/Delete user
│   ├── admin/
│   │   ├── dashboard/page.tsx       # Admin dashboard
│   │   └── users/                   # User management pages
│   ├── manager/
│   │   └── dashboard/page.tsx       # Manager dashboard
│   ├── staff/
│   │   └── entry/page.tsx           # Staff data entry
│   ├── login/page.tsx               # Login page
│   ├── unauthorized/page.tsx        # Access denied page
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Global styles
├── components/
│   ├── auth/
│   │   └── login-form.tsx           # Login form component
│   ├── layout/
│   │   └── navbar.tsx               # Navigation bar
│   ├── users/
│   │   ├── user-form.tsx            # User create/edit form
│   │   └── user-table.tsx           # Users list table
│   └── ui/                          # shadcn/ui components
├── lib/
│   ├── auth/
│   │   ├── jwt.ts                   # JWT utilities
│   │   ├── password.ts              # Password hashing
│   │   └── permissions.ts           # Role-based permissions
│   ├── middleware/
│   │   └── auth.ts                  # API authentication middleware
│   └── utils.ts                     # Utility functions
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── seed.ts                      # Database seeding
├── types/
│   ├── auth.ts                      # Auth type definitions
│   └── user.ts                      # User type definitions
├── middleware.ts                    # Next.js middleware (route protection)
├── .env                             # Environment variables
└── package.json                     # Dependencies

```

## 🛡️ API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with email/phone and password

**Request Body:**
```json
{
  "identifier": "admin@brickiln.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Super Admin",
    "email": "admin@brickiln.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  },
  "message": "Login successful"
}
```

#### POST `/api/auth/logout`
Logout current user

#### GET `/api/auth/me`
Get current authenticated user details

### User Management (Admin Only)

#### GET `/api/users`
List all users

#### POST `/api/users`
Create a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "SecurePass@123",
  "role": "STAFF",
  "status": "ACTIVE"
}
```

#### GET `/api/users/:id`
Get a single user by ID

#### PUT `/api/users/:id`
Update user details

#### DELETE `/api/users/:id`
Delete a user

## 🔒 Security Features

- ✅ HTTP-only cookies for JWT storage
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token expiration (7 days)
- ✅ Server-side route protection
- ✅ Client-side route protection (middleware)
- ✅ Role-based API access control
- ✅ Input validation with Zod
- ✅ Unique email and phone constraints
- ✅ Inactive user check on login

## 🎨 UI/UX Features

- ✅ Clean, modern design with TailwindCSS
- ✅ Responsive layout (mobile-friendly)
- ✅ Premium gradient backgrounds
- ✅ Loading states and animations
- ✅ Error handling with alerts
- ✅ Role-based navigation
- ✅ Accessible components (shadcn/ui)
- ✅ Brick kiln themed color palette

## 🧪 Testing

Test the following scenarios:

1. **Valid Login**: Login with default credentials
2. **Invalid Credentials**: Try wrong password
3. **Inactive User**: Set a user to INACTIVE and try login
4. **Role-Based Access**:
   - Login as Staff and try to access `/admin/users` (should redirect to unauthorized)
   - Login as Manager and access `/manager/dashboard` (should work)
   - Login as Admin and access all routes (should work)
5. **Protected API Routes**: Use browser DevTools to make API calls without auth token
6. **User CRUD Operations**: Create, edit, and delete users as Admin

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

## 🚧 Coming Soon

Future modules planned for the Brick Kiln Management System:

- 📊 Sales Management
- 💰 Expense Tracking
- 📈 Reports & Analytics
- 👷 Worker Attendance
- 🏭 Production Tracking
- 📦 Inventory Management
- 💳 Payment Processing

## 🛠️ Development

### Available Scripts

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed database
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Complete setup (install + generate + push + seed)
npm run setup
```

### Database Management

View and manage your database using Prisma Studio:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

## 📄 License

Proprietary - Brick Kiln Management System

## 👨‍💻 Support

For issues or questions, please contact your system administrator.

---

**Built with ❤️ for Brick Kiln Management**
