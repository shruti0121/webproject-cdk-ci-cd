#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { RicemillCdkStack } from '../lib/ricemill_cdk-stack';

const app = new cdk.App();
new RicemillCdkStack(app, 'RicemillCdkStack');
