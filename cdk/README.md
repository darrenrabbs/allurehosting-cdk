# AWS CDK alternative (TypeScript)

This folder provides an AWS CDK (TypeScript) stack that mirrors the Terraform module:

- Private S3 bucket for Allure reports (block public access)
- CloudFront distribution with Origin Access Control (OAC)
- SPA routing: map 403/404 to /index.html
- Outputs: bucket name and CloudFront domain

## Prereqs

- Node 18+
- AWS credentials configured (account + region)

## Install deps

```bash
cd infra/cdk
npm install
```

## Synthesize

```bash
# Required: PROJECT and REGION
make cdk-synth PROJECT=allurehosting REGION=us-east-1
```

## Deploy

```bash
# Required: PROJECT and REGION
# Optional: DOMAIN and ACM_CERT_ARN (cert must be in us-east-1 for CloudFront)
make cdk-deploy PROJECT=allurehosting REGION=us-east-1 \
  DOMAIN=reports.example.com ACM_CERT_ARN=arn:aws:acm:us-east-1:123:certificate/abc
```

Outputs include:

- bucket
- cloudfront_domain

Then use these in publish-allure: `--bucket` and `--cloudfront https://<cloudfront_domain>`.

## Notes

- You may need to bootstrap the account and region once:
  cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
- CloudFront custom domains require ACM certificates in us-east-1.
- After deploy, use outputs with publish-allure:
  publish-allure --bucket <bucket> --project <project> --branch <branch> --cloudfront https://<cloudfront_domain>
