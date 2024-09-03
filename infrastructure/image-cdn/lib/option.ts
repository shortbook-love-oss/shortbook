'use strict';

export const imageBucketTransferKeys = ['profile', 'book-cover', 'ogp', 'user-asset'] as const;
export type ImageBucketTransferKey = (typeof imageBucketTransferKeys)[number];

export interface ImageDistributionOption {
	toExtension: AllowedToExtension;
	width: number;
	height: number;
	fit: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
	quality: number;
}

export interface ImageConvertOption extends ImageDistributionOption {
	transferKey: ImageBucketTransferKey;
	prefix: string;
	imageName: string;
	fromExtension: AllowedFromExtension;
}

export const vectorFileExtensions = ['svg'] as const;
export type VectorFileExtension = (typeof vectorFileExtensions)[number];

export const imageExtensionMIME: Record<string, string> = {
	'png': 'image/png',
	'jpg': 'image/jpeg',
	'gif': 'image/gif',
	'webp': 'image/webp',
	'avif': 'image/avif',
	'heic': 'image/heic',
	'heif': 'image/heif',
	'tiff': 'image/tiff',
	'bmp': 'image/bmp',
	'ico': 'image/x-icon',
	'svg': 'image/svg+xml'
};

export const allowedToExtensions = [
	'jpg',
	'jpeg',
	'png',
	'gif',
	'webp',
	'avif',
	...vectorFileExtensions,
	'heic',
	'heif',
	'tiff',
	'bmp',
	'ico'
] as const;
export type AllowedToExtension = (typeof allowedToExtensions)[number];

export const allowedFromExtensions = [
	...allowedToExtensions,
	'heic',
	'heif',
	'tiff',
	'bmp',
	'ico'
] as const;
export type AllowedFromExtension = (typeof allowedFromExtensions)[number];

// contain ... Keep aspect, not clip
// cover ... Keep aspect, clip
// fill ... Stretch, not clip, keep width or height original if it's not specified
// inside ... Keep aspect, not clip, maybe make space
// outside ... Keep aspect, not clip, maybe overflow
export const allowedSize = [
	1, 16, 24, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 256, 288, 320, 384, 448,
	480, 512, 576, 672, 768, 896, 1024, 1080, 1152, 1280, 1440, 1536, 1600, 1920, 2160, 2400, 2560,
	3384, 3440, 3840, 4096, 4320, 6016, 7680
];
export const allowedResizeFit = [
	'contain',
	'cover',
	'fill',
	'inside',
	'outside'
] as ImageDistributionOption['fit'][];
export const allowedQuality = [10, 20, 40, 60, 80, 90, 100];

export const defaultToExtension = 'jpg';
export const defaultResizeFit: ImageDistributionOption['fit'] = 'cover';
export const defaultQuality = 60;
