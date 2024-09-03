'use strict';

import {
	allowedQuality,
	allowedResizeFit,
	allowedSize,
	allowedToExtensions,
	defaultQuality,
	defaultResizeFit,
	defaultToExtension,
	vectorFileExtensions,
	type AllowedFromExtension,
	type AllowedToExtension,
	type ImageBucketTransferKey,
	type ImageConvertOption,
	type ImageDistributionOption,
	type VectorFileExtension
} from './option';

export interface StorageBucket {
	storageBucketName: string;
	storageCdnRegion: string;
	storageCdnBucketName: string;
	storageCdnStorageClass: string;
}

export function decodeViewerRequestUri(uri: string) {
	// Example "/profile/abcdefg/current/image.original.jpg"
	const match = uri.match(/([^/]+)\/(.+)\/([^/]*)\.(.+)/);
	if (!match) {
		return null;
	}

	const transferKey = match[1] as ImageBucketTransferKey; // "profile"
	const prefix = match[2]; // "abcdefg/current"
	const imageName = match[3]; // "image.original"
	const fromExtension = match[4].toLowerCase() as AllowedFromExtension; // "jpg"

	return {
		transferKey,
		prefix,
		imageName,
		fromExtension
	};
}

export function optionToParam(
	optionQuery: string,
	fromExtension: AllowedToExtension
): ImageDistributionOption {
	// "ext={paramExtension}&w=${paramWidth}&h=${height}&fit=${paramFit}&q=${paramQuality}"
	const params = new URLSearchParams(optionQuery);

	const paramExtension = params.get('ext') as AllowedToExtension;
	let toExtension = defaultToExtension as AllowedToExtension;
	if (paramExtension && allowedToExtensions.includes(paramExtension)) {
		toExtension = paramExtension;
	} else if (allowedToExtensions.includes(fromExtension as AllowedToExtension)) {
		// Use file name extension
		toExtension = fromExtension;
	}
	// Can't convert raster to vector, set to original extension
	const isFromNoResizeExt = vectorFileExtensions.includes(fromExtension as VectorFileExtension);
	const isToNoResizeExt = vectorFileExtensions.includes(toExtension as VectorFileExtension);
	if (!isFromNoResizeExt && isToNoResizeExt) {
		toExtension = fromExtension;
	}

	let width = 0;
	let height = 0;
	const paramWidth = Number(params.get('w'));
	const paramHeight = Number(params.get('h'));
	for (let size of allowedSize) {
		if (paramWidth === size) {
			width = paramWidth;
			break;
		}
	}
	for (let size of allowedSize) {
		if (paramHeight === size) {
			height = paramHeight;
			break;
		}
	}
	// Not resize if vector-graph
	if (isToNoResizeExt) {
		width = 0;
		height = 0;
	}

	const paramFit = params.get('fit') as ImageDistributionOption['fit'];
	let fit = defaultResizeFit;
	if (paramFit && allowedResizeFit.includes(paramFit)) {
		fit = paramFit;
	}

	let quality = defaultQuality;
	if (allowedQuality.includes(Number(params.get('q')))) {
		quality = Number(params.get('q'));
	}

	return {
		toExtension,
		width,
		height,
		fit,
		quality
	};
}

export function decodeOriginResponseUri(url: string): ImageConvertOption | undefined {
	// "profile/abcdefg/current/ext={paramExtension}&w=${paramWidth}&h=${height}&fit=${paramFit}&q=${paramQuality}/image.origin.jpg"
	const match = url.match(/([^/]+)\/(.+)\/(.+)\/([^/]*)\.(.+)/);
	if (!match) {
		return undefined;
	}

	const transferKey = match[1] as ImageBucketTransferKey; // "profile"
	const prefix = match[2]; // "abcdefg/current"
	const optionParam = match[3]; // "ext={paramExtension}&w=${paramWidth}&h=${height}&fit=${paramFit}&q=${paramQuality}"
	const imageName = match[4]; // "image.origin"
	const fromExtension = match[5].toLowerCase() as AllowedFromExtension; // "jpg"

	return {
		transferKey,
		prefix,
		imageName,
		fromExtension,
		...optionToParam(optionParam, fromExtension)
	};
}
