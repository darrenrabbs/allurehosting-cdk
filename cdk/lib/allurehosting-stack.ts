import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface AllureHostingProps extends cdk.StackProps {
  project: string;
  domainName?: string;
  acmCertArn?: string;
}

export class AllureHostingStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: AllureHostingProps) {
    super(scope, id, props);

    const accountId = cdk.Stack.of(this).account;
    const bucket = new s3.Bucket(this, 'ReportsBucket', {
      // Add account id suffix for global uniqueness (still deterministic per account+project)
      bucketName: `${props.project}-allure-hosting-${accountId}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Use legacy Origin Access Identity for simplicity (CDK higher-level construct support)
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `Access identity for ${props.project} allure reports`,
    });

    const cert = props.domainName && props.acmCertArn
      ? acm.Certificate.fromCertificateArn(this, 'Cert', props.acmCertArn)
      : undefined;

    const dist = new cloudfront.Distribution(this, 'Cdn', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(bucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: cdk.Duration.seconds(0) },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: cdk.Duration.seconds(0) },
      ],
      domainNames: props.domainName ? [props.domainName] : undefined,
      certificate: cert,
    });

    // Grant read to OAI (adds appropriate bucket policy statement automatically)
    bucket.grantRead(oai);

    this.bucket = bucket;
    this.distribution = dist;

    new cdk.CfnOutput(this, 'bucket', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'cloudfront_domain', { value: dist.domainName });
  }
}
