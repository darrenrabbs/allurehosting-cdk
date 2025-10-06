# Allure Hosting — AWS CDK Stack

This repository provides an **AWS CDK application** for securely hosting Allure test reports on AWS, using **private S3 buckets** behind **CloudFront with Origin Access Control (OAC)**.

It is automatically mirrored from the private [`allurehosting`](https://github.com/<your-username>/allurehosting) repository to make the infrastructure-as-code (IaC) setup publicly available.

---

## 🧩 Overview

This CDK stack provisions:

- **S3 Bucket** — Private bucket for storing Allure static reports (`Block Public Access` enabled).
- **CloudFront Distribution** — Serves reports via OAC-secured HTTPS endpoints.
- **Bucket Policy** — Grants read access only to the CloudFront distribution.
- **Optional Lifecycle Rules** — For automatic report cleanup or version retention.
- **Outputs** — Bucket name and CloudFront domain for integration with `publish-allure`.

---

## ⚙️ Deployment Steps

1. Install dependencies:
   ```bash
   npm install -g aws-cdk
   pip install -r requirements.txt
