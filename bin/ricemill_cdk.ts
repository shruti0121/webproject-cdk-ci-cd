#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { RicemillCdkStack } from '../lib/ricemill_cdk-stack';

const app = new cdk.App();
new RicemillCdkStack(app, 'RicemillCdkStack',{
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-2",
  },
});
