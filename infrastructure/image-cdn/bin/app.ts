#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as lib from '../lib';
import { PREFIX } from '../lib/env';

const app = new cdk.App();
const nodeLambdaEdge = new lib.AssetsNodeLambdaEdgeStack(
	app,
	`${PREFIX}-image-cdn-lambda`,
	lib.assetsLambdaEdgeParams,
	{ env: lib.envLambda }
);
const cloudFront = new lib.CloudFrontAssetsStack(
	app,
	`${PREFIX}-image-cdn-cloudfront`,
	lib.cfAssetsParams,
	{ env: lib.envCloudFront }
);
cloudFront.addDependency(nodeLambdaEdge);
