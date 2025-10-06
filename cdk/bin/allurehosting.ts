#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { AllureHostingStack } from '../lib/allurehosting-stack';

const app = new cdk.App();

const project = app.node.tryGetContext('project') as string | undefined;
const domainName = app.node.tryGetContext('domainName') as string | undefined;
const acmCertArn = app.node.tryGetContext('acmCertArn') as string | undefined;
const envRegion = app.node.tryGetContext('region') as string | undefined;

// Always allow the app to run with zero stacks (e.g., during `cdk bootstrap`, `cdk context`, or accidental calls
// without passing required context). We only synthesize a stack when a project name is provided.
if (!project) {
  // Silent noop (CDK CLI handles cases like bootstrap which do not require any stacks).
  // Uncomment for debug: console.error('No -c project=<name> provided; not synthesizing any stacks.');
} else {
  new AllureHostingStack(app, `${project}-allurehosting`, {
    project,
    domainName,
    acmCertArn,
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: envRegion ?? process.env.CDK_DEFAULT_REGION },
  });
}
