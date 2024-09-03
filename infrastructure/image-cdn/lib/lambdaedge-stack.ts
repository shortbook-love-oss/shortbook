import { Stack, StackProps, aws_lambda, Duration, aws_iam } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { CrossRegionParam } from './cross-region-param';
import { AWS_DEFAULT_REGION, PREFIX } from './env';

export interface IAssetsLambdaEdgeStack {
	s3BucketNames: string[];
}

const registerFunction = (params: {
	constructor: Stack;
	func: aws_lambda.Function;
	cfType: 'viewer-request' | 'origin-response';
}) => {
	new aws_lambda.Alias(params.constructor, `alias-${params.cfType}`, {
		aliasName: 'latest',
		version: params.func.currentVersion
	});
	new CrossRegionParam(params.constructor, `cross-region-param-${params.cfType}`, {
		region: AWS_DEFAULT_REGION
	}).putSsmParameter({
		parameterName: `/${PREFIX}/assets-stack/lambda-edge/${params.cfType}`,
		parameterValue: `${params.func.functionArn}:${params.func.currentVersion.version}`,
		parameterDataType: 'text',
		idName: `cross-region-params-${params.cfType}`
	});
};

/**
 * CloudFront stack for images
 */
export class AssetsNodeLambdaEdgeStack extends Stack {
	constructor(scope: Construct, id: string, params: IAssetsLambdaEdgeStack, props?: StackProps) {
		super(scope, id, props);

		const role = new aws_iam.Role(this, 'lambdaRole', {
			roleName: `${PREFIX}-edge-node-role`,
			assumedBy: new aws_iam.CompositePrincipal(
				new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
				new aws_iam.ServicePrincipal('edgelambda.amazonaws.com')
			),
			managedPolicies: [
				aws_iam.ManagedPolicy.fromManagedPolicyArn(
					this,
					'cloudwatch',
					'arn:aws:iam::aws:policy/CloudWatchFullAccess'
				)
			],
			inlinePolicies: {
				accessS3: new aws_iam.PolicyDocument({
					statements: [
						new aws_iam.PolicyStatement({
							effect: aws_iam.Effect.ALLOW,
							resources: params.s3BucketNames
								.map((name) => [`arn:aws:s3:::${name}/*`, `arn:aws:s3:::${name}`])
								.flat(),
							actions: ['s3:*']
						})
					]
				})
			}
		});

		const edgeViewerRequest = new NodejsFunction(this, `${PREFIX}-edge-viewer-request`, {
			entry: 'lib/handlers/viewer-request.ts',
			runtime: aws_lambda.Runtime.NODEJS_20_X,
			memorySize: 128,
			timeout: Duration.seconds(5),
			architecture: aws_lambda.Architecture.X86_64,
			role
		});
		registerFunction({
			constructor: this,
			func: edgeViewerRequest,
			cfType: 'viewer-request'
		});

		const edgeOriginResponse = new NodejsFunction(this, `${PREFIX}-edge-origin-response`, {
			entry: 'lib/handlers/origin-response.ts',
			runtime: aws_lambda.Runtime.NODEJS_20_X,
			memorySize: 256,
			timeout: Duration.seconds(30),
			architecture: aws_lambda.Architecture.X86_64,
			role
		});
		registerFunction({
			constructor: this,
			func: edgeOriginResponse,
			cfType: 'origin-response'
		});
	}
}
