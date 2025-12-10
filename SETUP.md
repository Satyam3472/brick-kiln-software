# 🛠️ Setup Guide - Brick Kiln Management System

Complete step-by-step guide to set up the Brick Kiln Management System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

3. **Git** (for cloning repository)
   - Download from: https://git-scm.com/

### Optional Tools

- **Prisma Studio** - Visual database browser (included in dependencies)
- **VS Code** - Recommended code editor with TypeScript support

## Step-by-Step Installation

### 1. Clone or Navigate to Project Directory

```bash
cd /Users/geetanjalikashyap/Desktop/brick-kiln-software
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- Prisma
- React
- TailwindCSS
- shadcn/ui components
- Authentication libraries

**Expected time**: 2-3 minutes

### 3. Setup PostgreSQL Database

#### Option A: Using Local PostgreSQL

1. Start PostgreSQL service:
   ```bash
   # macOS (if installed via Homebrew)
   brew services start postgresql@14
   
   # Or check if it's already running
   pg_isready
   ```

2. Create database:
   ```bash
   # Login to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE brick_kiln_db;
   
   # Create user (if needed)
   CREATE USER postgres WITH PASSWORD 'postgres';
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE brick_kiln_db TO postgres;
   
   # Exit psql
   \q
   ```

#### Option B: Using Docker

```bash
# Pull and run PostgreSQL container
docker run --name brick-kiln-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=brick_kiln_db \
  -p 5432:5432 \
  -d postgres:14

# Verify it's running
docker ps
```

### 4. Configure Environment Variables

The `.env` file should already exist with default values. Verify it contains:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brick_kiln_db"
JWT_SECRET="brick-kiln-jwt-secret-change-in-production-2024"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important**: Change `JWT_SECRET` in production to a strong random string.

### 5. Setup Database Schema

Run all database setup commands:

```bash
# This runs: generate + push + seed
npm run setup
```

Or run individually:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push

# Seed database with default users
npm run prisma:seed
```

You should see output like:
```
✅ Super Admin created
✅ Sample Manager created
✅ Sample Staff created
🎉 Database seeding completed successfully!
```

### 6. Verify Database Setup

```bash
# Open Prisma Studio to view database
npm run prisma:studio
```

This opens http://localhost:5555 where you can:
- View all tables
- See seeded users
- Verify schema is correct

### 7. Start Development Server

```bash
npm run dev
```

The application will start on http://localhost:3000

You should see:
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Ready in 2.1s
```

### 8. Verify Installation

1. **Open Browser**: Navigate to http://localhost:3000
2. **Should Redirect**: Automatically redirects to `/login`
3. **Test Login**: Use default credentials:
   ```
   Email: admin@brickiln.com
   Password: Admin@123
   ```
4. **Expected Result**: Redirects to `/admin/dashboard`

## Troubleshooting

### Common Issues

#### Issue 1: PostgreSQL Connection Error

**Error**: `Can't reach database server`

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it
brew services start postgresql@14

# Or check Docker container
docker ps
```

#### Issue 2: Database Already Exists

**Error**: `Database 'brick_kiln_db' already exists`

**Solution**:
```bash
# Drop and recreate
psql postgres -c "DROP DATABASE brick_kiln_db;"
psql postgres -c "CREATE DATABASE brick_kiln_db;"

# Then re-run setup
npm run setup
```

#### Issue 3: Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### Issue 4: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npm run prisma:generate
```

#### Issue 5: Node Modules Issues

**Error**: Various dependency errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Database Reset

If you need to completely reset the database:

```bash
# Drop all tables
npx prisma db push --force-reset

# Re-seed
npm run prisma:seed
```

## Production Deployment

### Environment Variables for Production

Create a `.env.production` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="[GENERATE-A-STRONG-RANDOM-SECRET]"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Deployment Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use secure database credentials
- [ ] Enable SSL for database connection
- [ ] Set up proper CORS policies
- [ ] Configure domain and SSL certificate
- [ ] Set up backup strategy for database
- [ ] Configure monitoring and logging
- [ ] Review security headers
- [ ] Test all authentication flows
- [ ] Verify role-based access control

## Next Steps

After successful setup:

1. **Login as Admin**: Test admin dashboard and user management
2. **Create Test Users**: Add Manager and Staff accounts
3. **Test Role Access**: Login with different roles
4. **Explore API**: Use browser DevTools Network tab
5. **Check Database**: Use Prisma Studio to view data

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## Support

If you encounter any issues not covered in this guide, contact your system administrator.

---

**Ready to build amazing features! 🚀**
