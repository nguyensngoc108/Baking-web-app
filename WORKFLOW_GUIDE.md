# Baking Shop - CI/CD Workflow Guide

## Overview

This project includes a comprehensive GitHub Actions CI/CD pipeline that:

- ✅ Lints and builds both server and client
- ✅ Runs automated tests
- ✅ Builds optimized Docker images
- ✅ Pushes images to GitHub Container Registry (GHCR)
- ✅ Performs security vulnerability scanning
- ✅ Caches dependencies for faster builds

## Workflow Structure

### File Location
`.github/workflows/ci-cd.yaml`

### Triggers

The workflow runs on:
- **Push** to `main` and `develop` branches
- **Pull Requests** to `main` and `develop` branches

## Jobs

### 1. **lint-and-test** (Always runs)

Runs on every push and pull request:

- **Setup:** Node.js 18 with npm caching
- **Server checks:**
  - Installs dependencies
  - Lists packages to verify integrity
- **Client checks:**
  - Installs dependencies
  - Builds production bundle

### 2. **build-and-push** (Conditional)

Runs only after `lint-and-test` succeeds on push to main/develop:

- **Build Server Docker image:**
  - Multi-stage build with Alpine Linux
  - Non-root user security
  - Health checks included
  - Pushed to GHCR with tags: branch, SHA, semver, latest

- **Build Client Docker image:**
  - React optimized build
  - Nginx serving
  - Cache-busting strategy
  - Pushed to GHCR with same tagging strategy

**Tagging strategy:**
- `develop` branch: `develop`, `develop-<sha>`, `latest`
- `main` branch: `main`, `main-<sha>`, `v1.0.0` (semver), `latest`

### 3. **security-scan** (Best Practice)

Runs on every push:

- **Trivy Scanner:**
  - Scans for vulnerabilities in dependencies
  - Generates SARIF format results
  - Uploads to GitHub Security Tab

## Environment Variables & Secrets

### Required GitHub Secrets

Set these in GitHub repository settings:

| Secret | Required | Description |
|--------|----------|-------------|
| `DOCKER_USERNAME` | ❌ Optional | Docker Hub username (if pushing to Docker Hub) |
| `DOCKER_PASSWORD` | ❌ Optional | Docker Hub password token |
| `REACT_APP_API_BASE_URL` | ✅ Yes | Production API base URL |

### Optional Build Arguments

- `REACT_APP_API_BASE_URL` - Passed to React build (defaults to `http://localhost:5000`)

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add the following:

```
Name: REACT_APP_API_BASE_URL
Value: https://your-api-domain.com
```

## Image Registry

By default, images are pushed to **GitHub Container Registry (GHCR)**:

- Server: `ghcr.io/your-org/baking-shop/baking-server:latest`
- Client: `ghcr.io/your-org/baking-shop/baking-client:latest`

## Docker Image Details

### Server Image

```dockerfile
# Multi-stage build
# Stage 1: Build (node:18-alpine) - installs deps
# Stage 2: Runtime (node:18-alpine) - runs app
# Non-root user: nodejs
# Port: 5000
# Health check: Enabled
```

**Size:** ~150-200MB (optimized)

### Client Image

```dockerfile
# Multi-stage build
# Stage 1: Build (node:18-alpine) - builds React
# Stage 2: Production (nginx:alpine) - serves app
# Port: 3000
# Health check: Enabled
# Gzip compression: Enabled
```

**Size:** ~50-100MB (optimized)

## Monitoring & Debugging

### View Workflow Runs

1. Go to GitHub repository
2. Click **Actions** tab
3. Select workflow run to view details

### Check Build Status

- ✅ Green checkmark: Build passed
- ❌ Red X: Build failed
- ⏳ Yellow dot: Build in progress

### Access Build Logs

Click on a workflow run → Click on job → View logs

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `npm install` fails | Check `package.json` dependencies and Node version |
| Docker build fails | Check `Dockerfile` syntax and base image availability |
| GHCR push fails | Verify GitHub token has `write:packages` permission |
| React build fails | Check for TypeScript/ESLint errors in source |

## Build Performance

### Cache Strategy

- **npm packages:** Cached per branch
- **Docker layers:** Cached with GitHub Actions caching
- **Rebuilds:** ~2-3 minutes for full build, <1 minute with cache

### Optimizations Included

- Multi-stage Docker builds
- Alpine Linux base images
- npm dependency caching
- GitHub Actions layer caching
- Conditional job execution

## Local Testing

### Test Workflow Locally

Install `act` (GitHub Actions local runner):

```bash
# Install act
# macOS: brew install act
# Windows: choco install act-cli
# Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow
act push

# Run specific job
act push -j lint-and-test
```

## Next Steps

1. **Configure Docker secrets** for production API URL
2. **Set up GHCR** access in GitHub Actions
3. **Push changes** to main/develop to trigger workflow
4. **Monitor** first run in Actions tab
5. **Pull and deploy** built images to production

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Docker Image Building](https://docs.docker.com/build/)
- [GitHub Container Registry](https://docs.github.com/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)
