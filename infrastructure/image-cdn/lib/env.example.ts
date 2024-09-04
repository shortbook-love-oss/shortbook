import { Environment } from 'aws-cdk-lib';
import { ImageBucketTransferKey } from '$lib-backend/utilities/infrastructure/image';
import { ICfAssetsStack } from './cloudfront-assets-stack';
import { IAssetsLambdaEdgeStack } from './lambdaedge-stack';
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
	AWS_BUCKET_IMAGE_USER_ALBUM: 'XXXXXX'
}

export const cdnTransferIndex: Record<ImageBucketTransferKey, StorageBucket> = {
  profile: {
    storageBucketName: env.AWS_BUCKET_IMAGE_PROFILE,
    storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_PROFILE}-cdn`
  },
  'book-cover': {
    storageBucketName: env.AWS_BUCKET_IMAGE_BOOK_COVER,
    storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_BOOK_COVER}-cdn`
  },
  ogp: {
    storageBucketName: env.AWS_BUCKET_IMAGE_OGP,
    storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_OGP}-cdn`
  },
  'user-album': {
    storageBucketName: env.AWS_BUCKET_IMAGE_USER_ALBUM,
    storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_USER_ALBUM}-cdn`
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
