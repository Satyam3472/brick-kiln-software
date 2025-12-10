# 🐳 Docker Deployment Guide

Complete guide for running the Brick Kiln Management System using Docker and Docker Compose.

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)

Verify installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Start All Services

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at `http://localhost:3000`

### 2. Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Services

### PostgreSQL Database
- **Container**: `brick-kiln-postgres`
- **Port**: `5432`
- **Volume**: `postgres_data` (persistent storage)
- **Credentials**:
  - User: `postgres`
  - Password: `postgres`
  - Database: `brick_kiln_db`

### Next.js Application
- **Container**: `brick-kiln-app`
- **Port**: `3000`
- **Depends on**: PostgreSQL (with health check)

## Default Login Credentials

After the containers start, use these credentials:

- **Admin**: `admin@brickiln.com` / `Admin@123`
- **Manager**: `manager@brickiln.com` / `Manager@123`
- **Staff**: `staff@brickiln.com` / `Staff@123`

## Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Execute Commands in Container
```bash
# Access app container shell
docker-compose exec app sh

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d brick_kiln_db
```

### Rebuild Application
```bash
# Rebuild and restart
docker-compose up -d --build app

# Force rebuild without cache
docker-compose build --no-cache app
docker-compose up -d app
```

## Data Persistence

### PostgreSQL Data
Database data is stored in a Docker volume named `postgres_data`. This ensures data persists across container restarts.

View volumes:
```bash
docker volume ls
```

Inspect volume:
```bash
docker volume inspect brick-kiln-software_postgres_data
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres brick_kiln_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres brick_kiln_db < backup.sql
```

## Environment Variables

Edit `docker-compose.yml` to change environment variables:

```yaml
environment:
  DATABASE_URL: postgresql://postgres:postgres@postgres:5432/brick_kiln_db
  JWT_SECRET: your-custom-secret-here
  NEXT_PUBLIC_APP_URL: http://localhost:3000
```

**Important**: Change `JWT_SECRET` in production!

## Production Deployment

### 1. Update Environment Variables

Create a `.env.production` file:
```env
JWT_SECRET=your-strong-random-secret
DATABASE_URL=postgresql://postgres:secure-password@postgres:5432/brick_kiln_db
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Update docker-compose.yml

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-secure-password}
  
  app:
    env_file:
      - .env.production
```

### 3. Use SSL for Database

```yaml
services:
  postgres:
    command: >
      postgres
      -c ssl=on
      -c ssl_cert_file=/var/lib/postgresql/server.crt
      -c ssl_key_file=/var/lib/postgresql/server.key
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker-compose logs app
docker-compose logs postgres
```

### Database Connection Error

1. Ensure PostgreSQL is healthy:
```bash
docker-compose ps
```

2. Check health:
```bash
docker-compose exec postgres pg_isready -U postgres
```

3. Wait for PostgreSQL to be ready (first start may take 30-60 seconds)

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up -d --build
```

### Port Already in Use

If port 3000 or 5432 is already in use, edit `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "3001:3000"  # Use port 3001 instead
  
  postgres:
    ports:
      - "5433:5432"  # Use port 5433 instead
```

### View Container Resources

```bash
# View resource usage
docker stats

# View specific container
docker stats brick-kiln-app
```

## Development with Docker

### Hot Reload for Development

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      target: base
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
    environment:
      NODE_ENV: development
```

Run in development mode:
```bash
docker-compose -f docker-compose.dev.yml up
```

## Monitoring

### Health Checks

PostgreSQL has a built-in health check. The app container waits for PostgreSQL to be healthy before starting.

### Container Status

```bash
# Check if containers are running
docker-compose ps

# Check container health
docker inspect brick-kiln-postgres | grep -A 10 Health
```

## Security Considerations

1. **Change Default Passwords**: Update PostgreSQL password in production
2. **Use Secrets**: Use Docker secrets for sensitive data
3. **Network Isolation**: Containers communicate on an internal network
4. **JWT Secret**: Generate a strong random secret
5. **Volume Permissions**: Ensure proper file permissions
6. **Regular Updates**: Keep base images updated

```bash
# Update base images
docker-compose pull
docker-compose up -d
```

## Cleanup

### Remove Unused Resources

```bash
# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune

# Remove everything unused
docker system prune -a
```

---

**Docker Deployment Ready! 🚀**
