 RiceMill AWS Serverless Application
 
A serverless e-commerce application built using AWS CDK.

## Architecture

- S3 + CloudFront - Frontend hosting
- API Gateway - REST API
- Lambda - Backend logic
- DynamoDB - Database
- Cognito - Authentication
- SNS/SQS - Event driven order processing
- CDK - Infrastructure as Code
- GitHub Actions - CI/CD deployment

- ## Prerequisites

Install:
- Node.js 22
- AWS CLI
- AWS CDK

Configure AWS credentials:
aws configure

Install dependencies:
npm install

## Deploy Backend Infrastructure

Run:
cd ricemill-cdk
npm install
cdk bootstrap
cdk deploy


## Configure Frontend

After deployment, update:
with:

- Cognito User Pool ID
- Cognito Client ID
- API Gateway URL
- AWS Region


## CI/CD

Every push to `main` triggers GitHub Actions.

The workflow:

1. Checks out code
2. Installs Node dependencies
3. Runs CDK synth
4. Assumes AWS IAM role using GitHub OIDC
5. Deploys infrastructure automatically
