# LMS Portal Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Learning Management System (LMS) Portal to various environments.

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- npm or pnpm package manager
- Git for version control
- Access to deployment platforms (Vercel, AWS, etc.)

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=production
VITE_API_URL=https://your-api-domain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Authentication
JWT_SECRET=your-jwt-secret-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# SMS Service
SMS_SERVICE_API_KEY=your-sms-service-key
SMS_FROM=your-sender-id

# Security
BCRYPT_ROUNDS=12
ENCRYPTION_KEY=your-encryption-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=your-sentry-dsn
GOOGLE_ANALYTICS_ID=your-ga-id
```

## Local Development Deployment

### 1. Clone Repository
```bash
git clone https://github.com/your-org/lms-portal.git
cd lms-portal
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run Development Server
```bash
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### 5. Run Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# All tests
npm test
```

## Production Deployment

### Vercel Deployment (Recommended)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy Application
```bash
vercel --prod
```

#### 4. Configure Environment Variables
Add environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add all variables from your `.env` file

#### 5. Domain Configuration
- Add custom domain in Vercel dashboard
- Configure DNS records as instructed
- Enable SSL certificate (automatic)

### Alternative Deployment Options

#### AWS Deployment
1. **Frontend (S3 + CloudFront)**
   - Build application: `npm run build`
   - Upload `dist` folder to S3 bucket
   - Configure CloudFront distribution
   - Set up custom domain and SSL

2. **Backend (EC2 or Lambda)**
   - Setup EC2 instance or Lambda functions
   - Deploy API code
   - Configure load balancer
   - Setup RDS database

3. **Database (RDS)**
   - Create PostgreSQL RDS instance
   - Run database migrations
   - Configure backup and monitoring

#### Docker Deployment
1. **Build Docker Image**
   ```bash
   docker build -t lms-portal .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env lms-portal
   ```

3. **Docker Compose (Development)**
   ```bash
   docker-compose up -d
   ```

## Environment-Specific Configurations

### Staging Environment
- Use staging database and API endpoints
- Enable verbose logging
- Use test payment gateways
- Configure staging-specific email/SMS services

### Production Environment
- Use production database and API endpoints
- Enable minimal logging
- Use live payment gateways
- Configure production email/SMS services
- Enable monitoring and alerting

## Post-Deployment Tasks

### 1. Database Setup
```bash
# Run migrations
npm run db:migrate

# Seed initial data (if needed)
npm run db:seed
```

### 2. SSL Certificate Setup
- Generate SSL certificate (Let's Encrypt recommended)
- Configure web server (Nginx/Apache)
- Test HTTPS connectivity

### 3. Monitoring Setup
- Configure error tracking (Sentry)
- Setup performance monitoring
- Configure uptime monitoring
- Setup log aggregation

### 4. Backup Configuration
- Database backup automation
- File storage backup
- Configuration backup
- Test restore procedures

### 5. Security Hardening
- Configure firewall rules
- Setup intrusion detection
- Enable security headers
- Configure rate limiting
- Setup vulnerability scanning

## Rollback Procedures

### Quick Rollback
```bash
# Revert to previous deployment
vercel --prod --previous
```

### Database Rollback
```bash
# Restore from backup
npm run db:rollback
```

### Configuration Rollback
- Revert environment variables
- Restart application services
- Verify functionality

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors
- Review build logs

#### Database Connection Issues
- Verify database credentials
- Check network connectivity
- Review connection pool settings
- Test database accessibility

#### Performance Issues
- Check server resources (CPU, memory)
- Review database query performance
- Optimize frontend bundle size
- Configure caching strategies

#### Security Issues
- Review SSL certificate validity
- Check for exposed sensitive data
- Verify authentication flow
- Review access control policies

### Support Contacts
- Technical Team: tech@yourdomain.com
- DevOps Team: devops@yourdomain.com
- Security Team: security@yourdomain.com

## Maintenance Schedule

### Daily Tasks
- Monitor application logs
- Check error rates
- Verify backup completion
- Review performance metrics

### Weekly Tasks
- Update dependencies
- Review security alerts
- Optimize database performance
- Clean up old logs

### Monthly Tasks
- Security audit
- Performance review
- Capacity planning
- Documentation updates

### Quarterly Tasks
- Disaster recovery testing
- Penetration testing
- Architecture review
- Cost optimization review

## Success Metrics

### Performance KPIs
- Page load time < 3 seconds
- API response time < 200ms
- Uptime > 99.9%
- Error rate < 1%

### Security KPIs
- Zero critical vulnerabilities
- SSL certificate validity > 30 days
- Security audit score > 90%
- Incident response time < 4 hours

### Business KPIs
- User satisfaction > 95%
- Feature adoption rate > 80%
- Support ticket resolution < 24 hours
- Training completion rate > 90%