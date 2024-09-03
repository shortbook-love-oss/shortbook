import { Environment } from 'aws-cdk-lib';
import { ICfAssetsStack } from './cloudfront-assets-stack';
import { IAssetsLambdaEdgeStack } from './lambdaedge-stack';
import { ImageBucketTransferKey } from './option';
import { StorageBucket } from './utilities';

export const PREFIX: string = 'shortbook-image-cdn-v____';

export const AWS_ACCOUNT_ID = '1234567890';
export const AWS_DEFAULT_REGION = 'some-region';
export const AWS_CLOUDFRONT_REGION = 'some-region';

export const env = {
	AWS_DEFAULT_REGION,
	AWS_ACCESS_KEY_ID: 'XXXXXX',
	AWS_SECRET_ACCESS_KEY: 'XXXXXXXXXXXXXXXXXX',
	AWS_BUCKET_IMAGE_PROFILE: 'XXXXXX',
	AWS_BUCKET_IMAGE_BOOK_COVER: 'XXXXXX',
	AWS_BUCKET_IMAGE_OGP: 'XXXXXX',
	AWS_BUCKET_IMAGE_USER_ASSET: 'XXXXXX'
}

export const cdnTransferIndex: Record<ImageBucketTransferKey, StorageBucket> = {
	profile: {
		storageBucketName: env.AWS_BUCKET_IMAGE_PROFILE,
		storageCdnRegion: 'eu-north-1', // Sweden
		storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_PROFILE}-cdn--eun1-az3--x-s3`, // AZ-3
		storageCdnStorageClass: 'EXPRESS_ONEZONE' // <10 ms latency
	},
	'book-cover': {
		storageBucketName: env.AWS_BUCKET_IMAGE_BOOK_COVER,
		storageCdnRegion: 'eu-north-1', // Sweden
		storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_BOOK_COVER}-cdn--eun1-az2--x-s3`, // AZ-2
		storageCdnStorageClass: 'EXPRESS_ONEZONE'
	},
	ogp: {
		storageBucketName: env.AWS_BUCKET_IMAGE_OGP,
		storageCdnRegion: 'eu-north-1', // Sweden
		storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_OGP}-cdn--eun1-az1--x-s3`, // AZ-1
		storageCdnStorageClass: 'EXPRESS_ONEZONE'
	},
	'user-asset': {
		storageBucketName: env.AWS_BUCKET_IMAGE_USER_ASSET,
		storageCdnRegion: 'eu-north-1', // Sweden
		storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_USER_ASSET}-cdn--eun1-az2--x-s3`, // AZ-2
		storageCdnStorageClass: 'EXPRESS_ONEZONE'
	}
} as const;

export const cfAssetsParams: ICfAssetsStack = {
	cloudfront: {
		certificate: `arn:aws:acm:us-east-1:${AWS_ACCOUNT_ID}:certificate/aaaabbbb-cccc-dddd-eeee-ffffgggghhhh`,
		route53RecordName: 'image-cdn.shortbook.life',
		cfTransferIndex: cdnTransferIndex
	}
};

export const assetsLambdaEdgeParams: IAssetsLambdaEdgeStack = {
	s3BucketNames: Object.values(cdnTransferIndex)
		.map((transfer) => transfer.storageCdnBucketName)
		.filter(Boolean) as string[]
};

export const envCloudFront: Environment = {
	account: AWS_ACCOUNT_ID,
	region: 'some-region'
};

export const envLambda: Environment = {
	account: AWS_ACCOUNT_ID,
	region: 'us-east-1' // Always this
};
