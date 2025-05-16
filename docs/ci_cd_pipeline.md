# CI/CD Pipeline Documentation

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the NestJS backend
application.

## Overview

The CI/CD pipeline automates the process of building, testing, and deploying the application to different environments.
It consists of three main workflows:

1. **Continuous Integration (CI)**: Builds and tests the application
2. **Continuous Deployment (CD)**: Deploys the application to staging and production environments
3. **Environment Provisioning**: Sets up the necessary infrastructure for the application

## Workflow Diagrams

### CI/CD Process Flow

```
Code Change → CI Workflow → Tests Pass → CD Workflow → Deployment
                   ↓
                 Tests Fail
                   ↓
                 Fix Issues
```

### Environment Provisioning Flow

```
Manual Trigger → Provision Workflow → Infrastructure Created → Environment Configuration
```

## Continuous Integration (CI)

The CI workflow is triggered on:

- Push to main or develop branches
- Pull requests to main or develop branches

### CI Steps:

1. **Setup**: Prepares the environment with Node.js and PostgreSQL
2. **Install Dependencies**: Installs npm packages
3. **Lint**: Checks code quality with ESLint
4. **Build**: Compiles TypeScript code
5. **Unit Tests**: Runs Jest unit tests with coverage reporting
6. **E2E Tests**: Runs end-to-end tests against a test database

### CI Configuration:

The CI workflow is defined in `.github/workflows/ci.yml`. It uses:

- Node.js 18
- PostgreSQL 14
- Jest for testing
- Codecov for coverage reporting

## Continuous Deployment (CD)

The CD workflow is triggered after the CI workflow completes successfully on:

- Push to develop branch (deploys to staging)
- Push to main branch (deploys to production)

### CD Steps:

#### Staging Deployment:

1. **Build**: Compiles the application for staging
2. **Deploy**: Deploys to AWS Elastic Beanstalk staging environment
3. **Notify**: Sends a Slack notification

#### Production Deployment:

1. **Build**: Compiles the application for production
2. **Deploy**: Deploys to AWS Elastic Beanstalk production environment
3. **Release**: Creates a GitHub release
4. **Notify**: Sends a Slack notification

### CD Configuration:

The CD workflow is defined in `.github/workflows/cd.yml`. It uses:

- AWS Elastic Beanstalk for hosting
- AWS S3 for artifact storage
- GitHub Releases for versioning
- Slack for notifications

## Environment Provisioning

The environment provisioning workflow is triggered manually with an input parameter for the environment (staging or
production).

### Provisioning Steps:

1. **Setup**: Prepares the environment with Terraform
2. **Plan**: Creates a Terraform plan
3. **Apply**: Applies the Terraform plan to create infrastructure
4. **Configure**: Creates environment-specific configuration files
5. **Notify**: Sends a Slack notification

### Provisioning Configuration:

The provisioning workflow is defined in `.github/workflows/provision.yml`. It uses:

- Terraform for infrastructure as code
- AWS for cloud resources
- GitHub Actions artifacts for storing configurations
- Slack for notifications

## Required Secrets

The following secrets need to be configured in GitHub:

### AWS Secrets:

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET`: S3 bucket for deployments

### Database Secrets:

- `DB_PASSWORD`: Database password

### JWT Secrets:

- `JWT_SECRET`: Secret for JWT tokens
- `JWT_EXPIRATION`: JWT token expiration time

### Notification Secrets:

- `SLACK_WEBHOOK_URL`: Webhook URL for Slack notifications

## Environment Configuration

The application uses environment-specific configuration files:

- `.env.development`: Development environment
- `.env.test`: Test environment
- `.env.staging`: Staging environment
- `.env.production`: Production environment

These files are created or updated by the provisioning workflow based on the infrastructure created.

## Deployment Environments

### Staging Environment:

- Purpose: Testing and QA
- URL: https://api-staging.algosuite.example.com
- Deployed from: develop branch
- Database: algosuite_staging
- Features: Latest development changes

### Production Environment:

- Purpose: Live application
- URL: https://api.algosuite.example.com
- Deployed from: main branch
- Database: algosuite_production
- Features: Stable, tested changes

## Troubleshooting

### Common Issues:

#### CI Failures:

- **Test failures**: Check the test logs for details
- **Linting errors**: Run `npm run lint` locally to fix issues
- **Build errors**: Check for TypeScript errors

#### CD Failures:

- **Deployment failures**: Check AWS Elastic Beanstalk logs
- **Environment issues**: Verify environment variables
- **Permission issues**: Check AWS IAM permissions

#### Provisioning Failures:

- **Terraform errors**: Check Terraform state and logs
- **AWS API errors**: Verify AWS credentials and permissions
- **Resource limits**: Check AWS service quotas

### Rollback Procedure:

To rollback a deployment:

1. Go to AWS Elastic Beanstalk console
2. Select the environment (staging or production)
3. Go to "Application versions"
4. Select a previous working version
5. Click "Deploy"

## Monitoring

The CI/CD pipeline includes monitoring:

- **Build Status**: Available in GitHub Actions
- **Test Coverage**: Available in Codecov
- **Deployment Status**: Available in AWS Elastic Beanstalk
- **Notifications**: Sent to Slack

## Best Practices

1. **Branch Protection**: Enable branch protection for main and develop branches
2. **Code Reviews**: Require code reviews for pull requests
3. **Semantic Versioning**: Use semantic versioning for releases
4. **Environment Isolation**: Keep environments isolated
5. **Secret Management**: Store secrets securely in GitHub
6. **Infrastructure as Code**: Use Terraform for infrastructure
7. **Automated Testing**: Maintain high test coverage
8. **Monitoring**: Monitor deployments and application health