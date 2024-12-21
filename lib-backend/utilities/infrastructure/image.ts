export const imageBucketTransferKeys = ['profile', 'book-cover', 'ogp', 'user-album'] as const;
export type ImageBucketTransferKey = (typeof imageBucketTransferKeys)[number];

export type ImageFitOption = 'contain' | 'cover' | 'fill' | 'inside' | 'outside';

export interface ImageDistributionOption {
	toExtension: AllowedToExtension | '';
	width: number;
	height: number;
	fit: ImageFitOption;
	quality: number;
}

export interface ImageConvertOption extends ImageDistributionOption {
	transferKey: ImageBucketTransferKey;
	prefix: string;
	imageName: string;
}

export const vectorFileExtensions = ['svg'] as const;
export type VectorFileExtension = (typeof vectorFileExtensions)[number];

export const allowedToExtensions = [
	'jpg',
	'jpeg',
	'png',
	'gif',
	'webp',
	'avif',
	...vectorFileExtensions
] as const;
export type AllowedToExtension = (typeof allowedToExtensions)[number];

export const allowedFromExtensions = [...allowedToExtensions, 'tiff', 'ico', 'bmp'] as const;
export type AllowedFromExtension = (typeof allowedFromExtensions)[number];

// contain ... Keep aspect, not clip
// cover ... Keep aspect, clip
// fill ... Stretch, not clip, keep width or height original if it's not specified
// inside ... Keep aspect, not clip, maybe make space
// outside ... Keep aspect, not clip, maybe overflow
export const allowedSize = [
	1, 16, 24, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 256, 288, 320, 384, 448,
	480, 512, 576, 630, 672, 768, 896, 1024, 1080, 1152, 1200, 1280, 1440, 1536, 1600, 1920, 2160,
	2400, 2560, 3384, 3440, 3840, 4096, 4320, 6016, 7680
] as const;
export type AllowedSize = (typeof allowedSize)[number];

export const allowedResizeFit = [
	'contain',
	'cover',
	'fill',
	'inside',
	'outside'
] as ImageFitOption[];

export const allowedQuality = [10, 20, 40, 60, 80, 90, 100];
export type AllowedQuality = (typeof allowedQuality)[number];

export const defaultExtension: AllowedToExtension = 'png';
export const defaultResizeFit: ImageFitOption = 'cover';
export const defaultQuality = 60;

export function getExtensionForAll(fromExtension: AllowedFromExtension | ''): AllowedToExtension {
	// For example, heic is not compatible with Windows
	// So, convert to another extension that can be viewed on all browsers
	if (allowedToExtensions.includes(fromExtension as AllowedToExtension)) {
		return fromExtension as AllowedToExtension;
	} else {
		return defaultExtension;
	}
}
