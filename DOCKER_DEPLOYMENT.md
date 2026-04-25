# Docker Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

## Local Development

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Baking-web-app
   ```

2. **Create environment file:**
   ```bash
   cp server/.env.example .env.local
   ```
   Update `.env.local` with your credentials.

3. **Build and start containers:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Client: http://localhost:3000
   - Server API: http://localhost:5000
   - MongoDB: localhost:27017

### Common Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild images
docker-compose build

# Run migrations/seeds (if applicable)
docker-compose exec server npm run migrate
```

## Production Deployment

### Setup Production Environment

1. **Create `.env.prod` file with production variables:**
   ```env
   MONGO_USERNAME=prod_user
   MONGO_PASSWORD=secure_password
   JWT_SECRET=production_jwt_secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ADMIN_PASSWORD=secure_admin_password
   REACT_APP_API_BASE_URL=https://your-domain.com/api
   GITHUB_REPOSITORY=your-org/Baking-web-app
   ```

2. **Deploy with production compose file:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verify services are running:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

### Monitoring

```bash
# View service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service health
docker-compose -f docker-compose.prod.yml exec server curl -f http://localhost:5000/health || exit 1
```

### Database Backup

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --archive=/dump/backup.archive -u admin -p <password> --authenticationDatabase admin

# Restore MongoDB
docker-compose exec -T mongodb mongorestore --archive=/dump/backup.archive -u admin -p <password> --authenticationDatabase admin
```

### Update Production Deployment

1. **Pull latest images:**
   ```bash
   docker pull ghcr.io/<your-org>/baking-server:latest
   docker pull ghcr.io/<your-org>/baking-client:latest
   ```

2. **Restart services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## GitHub Actions CI/CD Workflow

The workflow automatically:

1. **Lints and builds** on every push to main/develop
2. **Runs tests** on the client and server
3. **Builds Docker images** for both services
4. **Pushes to GitHub Container Registry** (GHCR)
5. **Scans for security vulnerabilities** with Trivy

### Required Secrets for GitHub Actions

Add these secrets to your GitHub repository settings (Settings → Secrets and variables → Actions):

- `DOCKER_USERNAME` (optional, for Docker Hub)
- `DOCKER_PASSWORD` (optional, for Docker Hub)
- `REACT_APP_API_BASE_URL` (Production API URL)

### GitHub Actions Features

- **Multi-stage builds** for optimized images
- **Cache layers** for faster builds
- **Security scanning** with Trivy
- **Automatic tagging** (branch, SHA, semantic versioning)

## Image Optimization

Both Dockerfiles use multi-stage builds:

1. **Server (Node.js):**
   - Build stage: Installs dependencies
   - Runtime stage: Alpine Linux (small base image)
   - Non-root user for security
   - Health checks enabled

2. **Client (React):**
   - Build stage: Builds React app
   - Production stage: Nginx Alpine (optimized for static serving)
   - Gzip compression
   - Security headers
   - Cache-busting strategy

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs <service-name>

# Inspect image
docker inspect <image-id>

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Permission issues

```bash
# Fix file permissions
docker-compose exec server chown -R nodejs:nodejs /app
```

### Database connection errors

```bash
# Verify MongoDB health
docker-compose exec mongodb mongosh -u admin -p password
```

### Port conflicts

```bash
# Check port usage
netstat -ano | findstr :5000

# Use different ports in docker-compose.yml
```

## Best Practices

1. **Always use `.env` files** - Never commit secrets
2. **Use health checks** - Ensure services are ready
3. **Run as non-root** - Security best practice
4. **Use Alpine images** - Smaller, more secure base
5. **Cache dependencies** - Speed up builds
6. **Multi-stage builds** - Reduced final image size
7. **Regular updates** - Keep base images current
8. **Monitor logs** - Use centralized logging in production

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
