# RiceMill AWS Serverless Application

A serverless e-commerce application built using AWS CDK.

This project demonstrates a cloud-native application using AWS serverless services,
Infrastructure as Code (IaC), event-driven architecture, and CI/CD deployment.

---

# Architecture

The application uses:

- **S3 + CloudFront** - Frontend hosting
- **API Gateway** - REST API endpoint
- **AWS Lambda** - Backend business logic
- **DynamoDB** - Database storage
- **Amazon Cognito** - User authentication
- **SNS + SQS** - Event-driven order processing
- **AWS CDK** - Infrastructure as Code
- **GitHub Actions** - CI/CD deployment using GitHub OIDC

---

# Prerequisites

Before deploying, install:

- Node.js 22
- AWS CLI
- AWS CDK Toolkit

## Install Node.js

Download and install Node.js:

https://nodejs.org/en

Verify installation:

```bash
node -v
npm -v
```

---

## Install AWS CDK

Install the AWS CDK CLI globally:

```bash
npm install -g aws-cdk
```

Verify:

```bash
cdk --version
```

---

## Configure AWS Credentials

Configure your AWS account:

```bash
aws configure
```

You will need:

- AWS Access Key ID
- AWS Secret Access Key
- Default region

---

# Deployment Instructions

## 1. Clone Repository

```bash
git clone https://github.com/shruti0121/webproject-cdk-ci-cd.git

cd webproject-cdk-ci-cd
```

---

## 2. Install Dependencies

Install project dependencies:

```bash
npm install
```

---

## 3. Bootstrap CDK

CDK bootstrap is required the first time you deploy CDK applications
in an AWS account and region.

```bash
cdk bootstrap
```

This creates the AWS resources required by CDK, including the CDK toolkit stack.

---

## 4. Deploy AWS Infrastructure

Deploy the backend infrastructure:

```bash
cdk deploy
```

This creates:

- Lambda functions
- API Gateway APIs
- DynamoDB tables
- Cognito resources
- SNS topics
- SQS queues
- IAM roles
- S3 resources

After deployment, CDK will output required values such as:

- API Gateway URL
- Cognito User Pool ID
- Cognito Client ID

---

# Frontend Configuration

After deploying the backend, update:

```
ricemill-web-app-files/config.js
```

with your deployed AWS resources:

```javascript
window.APP_CONFIG = {
  region: "your-region",

  cognito: {
      userPoolId: "your-user-pool-id",
      clientId: "your-client-id"
  },

  api: {
      baseUrl: "your-api-gateway-url"
  }
};
```

The frontend requires these values to communicate with AWS services.

---

# Running Frontend

Upload the frontend files to your S3 bucket:

```bash
aws s3 sync ricemill-web-app-files s3://YOUR_BUCKET_NAME
```

---

# CI/CD Pipeline

This project uses GitHub Actions for automatic deployment.

Every push to the `main` branch triggers the workflow.

The pipeline:

1. Checks out the repository
2. Installs Node.js dependencies
3. Runs CDK synthesis
4. Authenticates with AWS using GitHub OIDC
5. Deploys AWS infrastructure using CDK

Workflow file:

```
.github/workflows/deploy.yml
```

---

# Infrastructure Deployment Flow

```
GitHub Push
      |
      v
GitHub Actions
      |
      v
OIDC Authentication
      |
      v
AWS IAM Role
      |
      v
CDK Deploy
      |
      v
CloudFormation
      |
      v
AWS Resources
```

---

# Useful CDK Commands

## Build project

```bash
npm run build
```

## Run tests

```bash
npm run test
```

## Synthesize CloudFormation template

```bash
cdk synth
```

## Compare deployed stack changes

```bash
cdk diff
```

## Deploy stack

```bash
cdk deploy
```

---

# Technologies Used

- TypeScript
- Node.js
- AWS CDK
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- Amazon Cognito
- Amazon SNS
- Amazon SQS
- Amazon S3
- CloudFront
- GitHub Actions
- GitHub OIDC
