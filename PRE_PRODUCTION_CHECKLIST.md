# Pre-Production Checklist

## 📋 Before Pushing to Production

### Environment & Secrets Setup
- [ ] Created `.env.prod` with production credentials
- [ ] Added `REACT_APP_API_BASE_URL` to GitHub Secrets
- [ ] Verified all sensitive data is NOT committed to git
- [ ] Updated MongoDB credentials to production values
- [ ] Updated JWT_SECRET to a strong production value
- [ ] Configured email service (SendGrid/Nodemailer)
- [ ] Set up Cloudinary credentials
- [ ] Verified ADMIN_PASSWORD is secure

### Docker Configuration
- [ ] Reviewed all Dockerfile contents
- [ ] Tested both Dockerfiles locally
- [ ] Verified `.dockerignore` files are present
- [ ] Tested docker-compose.yml (local development)
- [ ] Tested docker-compose.prod.yml (production)
- [ ] Confirmed nginx.conf security settings
- [ ] Verified health checks are working

### GitHub Actions Workflow
- [ ] Reviewed ci-cd.yaml configuration
- [ ] Confirmed workflow triggers (main, develop branches)
- [ ] Verified job dependencies and order
- [ ] Tested workflow with `act` (if available)
- [ ] Checked security scanning configuration
- [ ] Verified GHCR authentication

### Code Quality
- [ ] All dependencies in package.json are necessary
- [ ] No hardcoded secrets in code
- [ ] Dev dependencies vs production separated
- [ ] No console.log debugging statements (remove)
- [ ] Error handling implemented
- [ ] API endpoints validated

### Documentation
- [ ] README.md updated with deployment info
- [ ] WORKFLOW_GUIDE.md reviewed
- [ ] DOCKER_DEPLOYMENT.md reviewed
- [ ] SETUP_SUMMARY.md reviewed
- [ ] Deployment scripts (deploy.sh, deploy.bat) tested
- [ ] .env.docker template is complete

### Testing
- [ ] Local docker-compose build succeeds
- [ ] Server container starts and is healthy
- [ ] Client container starts and is healthy
- [ ] MongoDB connection works
- [ ] API endpoints respond correctly
- [ ] Client can connect to API
- [ ] Authentication flow works
- [ ] Image upload works
- [ ] Email service works

### Security Review
- [ ] No secrets in environment files
- [ ] Non-root user in Docker images
- [ ] Security headers configured in nginx
- [ ] CORS properly configured
- [ ] JWT validation working
- [ ] Password hashing implemented (bcryptjs)
- [ ] Input validation implemented
- [ ] SQL injection prevention (if using SQL)
- [ ] XSS protection in place
- [ ] CSRF tokens implemented

### Performance & Optimization
- [ ] React build is production-optimized
- [ ] Gzip compression enabled in nginx
- [ ] Cache-busting strategy implemented
- [ ] Static assets cached properly
- [ ] Database indexes optimized
- [ ] API response times acceptable
- [ ] Image sizes optimized

### Git & Repository
- [ ] `.github/workflows/ci-cd.yaml` committed
- [ ] All Dockerfiles committed
- [ ] docker-compose files committed
- [ ] Nginx config committed
- [ ] Documentation committed
- [ ] Deployment scripts committed
- [ ] `.env.docker` (template only) committed
- [ ] `.gitignore` updated to exclude `.env*` and `.env.prod`

### GitHub Actions Setup
- [ ] GITHUB_TOKEN has `write:packages` permission
- [ ] Secrets added to repository
- [ ] Workflow file syntax valid
- [ ] Branch protection rules (optional but recommended)
- [ ] Status checks configured

### Deployment Readiness
- [ ] Production server ready
- [ ] Database server ready (MongoDB Atlas or self-hosted)
- [ ] Domain/DNS configured
- [ ] SSL certificate ready
- [ ] Reverse proxy/load balancer configured (if needed)
- [ ] Monitoring tools setup
- [ ] Backup strategy defined
- [ ] Rollback plan documented

### Monitoring & Logging
- [ ] Centralized logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Health check endpoints accessible
- [ ] Database backups automated
- [ ] Log retention policy set

### Final Review
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance testing done
- [ ] Load testing (optional)
- [ ] Disaster recovery tested
- [ ] Team trained on deployment
- [ ] Documentation reviewed by team
- [ ] Approval from stakeholders

## 🚀 Deployment Steps

1. **Verify all checkboxes above are complete**

2. **Push to production branch:**
   ```bash
   git add .
   git commit -m "Production deployment setup with CI/CD and Docker"
   git push origin main
   ```

3. **Monitor GitHub Actions:**
   - Go to Actions tab
   - Watch workflow execution
   - Verify all jobs pass

4. **Pull Docker images:**
   ```bash
   docker pull ghcr.io/<org>/baking-shop/baking-server:latest
   docker pull ghcr.io/<org>/baking-shop/baking-client:latest
   ```

5. **Deploy to production:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

6. **Verify deployment:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs
   ```

7. **Test functionality:**
   - Access application: https://your-domain.com
   - Create account
   - Browse cakes
   - Place order
   - Admin panel
   - Email notifications

## 📊 Post-Deployment

- [ ] Monitor logs for errors
- [ ] Check resource usage (CPU, memory)
- [ ] Verify backups are working
- [ ] Test email notifications
- [ ] Verify analytics tracking
- [ ] Document any issues encountered
- [ ] Create runbook for common operations
- [ ] Schedule team meeting to review

## 🔄 Ongoing Maintenance

- [ ] Weekly log reviews
- [ ] Monthly security updates
- [ ] Quarterly performance review
- [ ] Database optimization
- [ ] Dependency updates
- [ ] SSL certificate renewal
- [ ] Backup restoration tests

## 📞 Support Contacts

- **DevOps Lead:** [Name/Contact]
- **Database Admin:** [Name/Contact]
- **Security Team:** [Name/Contact]
- **On-Call Rotation:** [Details]

## 📚 Important URLs & Credentials

| Service | URL | Status |
|---------|-----|--------|
| GitHub Repo | [URL] | ✓ |
| GHCR | [URL] | ✓ |
| Production Server | [URL] | ✓ |
| MongoDB | [URL] | ✓ |
| Monitoring Dashboard | [URL] | ✓ |

---

**Last Updated:** April 2026  
**Prepared By:** Development Team  
**Status:** Ready for Production Review
