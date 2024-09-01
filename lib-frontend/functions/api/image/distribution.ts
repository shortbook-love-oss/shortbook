import { env } from '$env/dynamic/private';
import type { StorageBucket } from '$lib/utilities/server/file';
import type { ImageBucketTransferKey } from '$lib/utilities/file';
import {
	allowedFromExtensions,
	allowedResizeFit,
	allowedSize,
	allowedToExtensions,
	type ImageConvertOption
} from '$lib/utilities/image';

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
		storageCdnRegion: 'eu-west-1', // Ireland
		storageCdnBucketName: `${env.AWS_BUCKET_IMAGE_USER_ASSET}-cdn`,
		storageCdnStorageClass: 'STANDARD'
	}
} as const;

export function isValidDistributionRequest(req: ImageConvertOption | null) {
	if (!req) {
		return false;
	}

	const invalidKeys: string[] = [];
	if (!allowedToExtensions.includes(req.toExtension)) {
		invalidKeys.push('toExtension');
	}
	// If width === 0, ignore width, keep aspect by height
	if (typeof req.width !== 'number' || req.width < 0 || Math.max(...allowedSize) < req.width) {
		invalidKeys.push('width');
	}
	// If width === 0, ignore height, keep aspect by width
	if (typeof req.height !== 'number' || req.height < 0 || Math.max(...allowedSize) < req.height) {
		invalidKeys.push('height');
	}
	if (!allowedResizeFit.includes(req.fit)) {
		invalidKeys.push('fit');
	}
	if (typeof req.quality !== 'number' || req.quality <= 0 || 100 < req.quality) {
		invalidKeys.push('quality');
	}
	if (!Object.keys(cdnTransferIndex).includes(req.transferKey)) {
		invalidKeys.push('transferKey');
	}
	if (typeof req.prefix !== 'string') {
		invalidKeys.push('prefix');
	}
	if (typeof req.imageName !== 'string' || req.imageName.includes('/')) {
		invalidKeys.push('imageName');
	}
	if (typeof req.fromExtension !== 'string' || !allowedFromExtensions.includes(req.fromExtension)) {
		invalidKeys.push('fromExtension');
	}
	if (invalidKeys.length > 0) {
		return invalidKeys;
	}

	return true;
}
