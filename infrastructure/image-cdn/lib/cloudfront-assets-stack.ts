import {
	aws_certificatemanager as aws_acm,
	aws_cloudfront,
	aws_cloudfront_origins,
	aws_lambda,
	aws_s3,
	aws_ssm,
	Duration,
	Stack,
	StackProps,
} from 'aws-cdk-lib';
import { type EdgeLambda, type BehaviorOptions, HttpVersion } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import type { ImageBucketTransferKey } from '$lib-backend/utilities/infrastructure/image';
import { PREFIX } from './env';
import { StorageBucket } from './utilities';

export interface ICfAssetsStack {
	cloudfront: {
		certificate: `arn:aws:acm:us-east-1:${string}:certificate/${string}`;
		route53RecordName: string;
		cfTransferIndex: Record<ImageBucketTransferKey, StorageBucket>;
	};
}

/**
 * CloudFront stack for images
 */
export class CloudFrontAssetsStack extends Stack {
	constructor(scope: Construct, id: string, params: ICfAssetsStack, props?: StackProps) {
		super(scope, id, props);

		// Reference Lambda@Edge
		const viewerRequestVersionParam = aws_ssm.StringParameter.fromStringParameterAttributes(
			this,
			`${PREFIX}-viewer-request-param`,
			{
				parameterName: `/${PREFIX}/assets-stack/lambda-edge/viewer-request`
			}
		).stringValue;
		const originResponseVersionParam = aws_ssm.StringParameter.fromStringParameterAttributes(
			this,
			`${PREFIX}-origin-response-param`,
			{
				parameterName: `/${PREFIX}/assets-stack/lambda-edge/origin-response`
			}
		).stringValue;
		const edgeViewerRequestVersion = aws_lambda.Version.fromVersionArn(
			this,
			`${PREFIX}-viewer-request-version`,
			viewerRequestVersionParam
		);
		const edgeOriginResponseVersion = aws_lambda.Version.fromVersionArn(
			this,
			`${PREFIX}-origin-response-version`,
			originResponseVersionParam
		);

		// CloudFront arguments etc.
		const certificate = aws_acm.Certificate.fromCertificateArn(
			this,
			`shortbook-us-east-1-certificate`,
			params.cloudfront.certificate
		);

		const originRequestPolicy = new aws_cloudfront.OriginRequestPolicy(
			this,
			`${PREFIX}-origin-request-policy`,
			{
				originRequestPolicyName: `${PREFIX}-origin-response-policy`,
				queryStringBehavior: aws_cloudfront.OriginRequestQueryStringBehavior.all()
			}
		);
		const edgeLambdas: EdgeLambda[] = [
			{
				functionVersion: edgeViewerRequestVersion,
				eventType: aws_cloudfront.LambdaEdgeEventType.VIEWER_REQUEST
			},
			{
				functionVersion: edgeOriginResponseVersion,
				eventType: aws_cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE
			}
		];
		const viewerProtocolPolicy = aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS;
		// See decodeQuerystring at utilities.ts
		const cacheQueryAllowList = ['ext', 'w', 'h', 'fit', 'q'];
		const cachePolicy = new aws_cloudfront.CachePolicy(
			this,
			`${PREFIX}-cache-policy`,
			{
				minTtl: Duration.seconds(0),
				defaultTtl: Duration.days(14),
				maxTtl: Duration.days(14),
				queryStringBehavior: aws_cloudfront.CacheQueryStringBehavior.allowList(...cacheQueryAllowList),
				enableAcceptEncodingGzip: true,
				enableAcceptEncodingBrotli: true
			}
		);

		const transfer = {} as Record<`/${ImageBucketTransferKey}/*`, BehaviorOptions>;
		for (const transferKey in params.cloudfront.cfTransferIndex) {
			const tKey = transferKey as ImageBucketTransferKey;
			transfer[`/${tKey}/*`] = {
				origin: new aws_cloudfront_origins.S3Origin(
					aws_s3.Bucket.fromBucketName(
						this,
						`${PREFIX}-source-${transferKey}`,
						params.cloudfront.cfTransferIndex[tKey].storageCdnBucketName
					)
				),
				edgeLambdas,
				originRequestPolicy,
				viewerProtocolPolicy,
				cachePolicy
			};
		}

		const distribution = new aws_cloudfront.Distribution(
			this,
			`${PREFIX}-assets-web-distribution`,
			{
				defaultBehavior: transfer['/profile/*'],
				additionalBehaviors: transfer,
				defaultRootObject: 'index.html',
				certificate: certificate,
				domainNames: [params.cloudfront.route53RecordName],
				httpVersion: HttpVersion.HTTP2_AND_3,
				sslSupportMethod: aws_cloudfront.SSLMethod.SNI,
				minimumProtocolVersion: aws_cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
				comment: 'Image CDN'
			}
		);
	}
}
