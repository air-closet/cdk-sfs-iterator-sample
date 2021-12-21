#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SfsStack } from '../lib/sfs-stack';

const app = new cdk.App();
new SfsStack(app, 'SfsStack');
