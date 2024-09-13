import sharp from 'sharp';
import { sharpFromBmp } from 'sharp-bmp';
import { sharpsFromIco, type ImageData as ImageDataIco } from 'sharp-ico';
import { env } from '$env/dynamic/private';
import { imageMIMEextension } from '$lib/utilities/file';
import {
	allowedFromExtensions,
	allowedResizeFit,
	allowedSize,
	allowedToExtensions,
	imageExtensionMIME,
	vectorFileExtensions,
	type AllowedFromExtension,
	type AllowedToExtension,
	type ImageBucketTransferKey,
	type ImageConvertOption,
	type VectorFileExtension
} from '$lib-backend/utilities/infrastructure/image';
import { getFile, uploadFile, type StorageBucket } from '$lib-backend/utilities/file';
import { getLargestImageFromIco } from '$lib-backend/utilities/image';

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

export function isValidDistributionRequest(req: ImageConvertOption | null) {
	if (!req) {
		return false;
	}

	const invalidKeys: string[] = [];
	if (req.toExtension && !allowedToExtensions.includes(req.toExtension)) {
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
	if (invalidKeys.length > 0) {
		return invalidKeys;
	}

	return true;
}

type ResponseConvertAndSaveSuccess = {
	image: Uint8Array;
	contentType: string;
	errorMessage?: never;
};
type ResponseConvertAndSaveError = {
	image?: never;
	contentType?: never;
	errorMessage: string;
};

export async function convertAndDeliver(
	reqOption: ImageConvertOption
): Promise<ResponseConvertAndSaveSuccess | ResponseConvertAndSaveError> {
	const transfer = cdnTransferIndex[reqOption.transferKey];

	const optionParam = new URLSearchParams();
	optionParam.set('ext', reqOption.toExtension);
	optionParam.set('w', String(reqOption.width));
	optionParam.set('h', String(reqOption.height));
	optionParam.set('fit', reqOption.fit);
	optionParam.set('q', String(reqOption.quality));

	// Get the converted file first, because it's faster
	const {
		file: convertedImage,
		contentType: convertedType,
		error: getConvertedError
	} = await getFile(
		env.AWS_DEFAULT_REGION,
		transfer.storageCdnBucketName,
		`${reqOption.prefix}/${reqOption.imageName}/${optionParam.toString()}/${reqOption.imageName}`
	);
	if (convertedImage && convertedType && !getConvertedError) {
		return { image: convertedImage, contentType: convertedType };
	}

	// Get the source image
	const {
		file,
		contentType,
		error: getFileError
	} = await getFile(
		env.AWS_DEFAULT_REGION,
		transfer.storageBucketName,
		`${reqOption.prefix}/${reqOption.imageName}`
	);
	if (getFileError || !file?.byteLength) {
		return { errorMessage: 'Original image not found.' };
	}

	const fromExtension = imageMIMEextension[contentType];
	if (!fromExtension || !allowedFromExtensions.includes(fromExtension as AllowedFromExtension)) {
		return { errorMessage: `Specied file format (${fromExtension}) does not supported.` };
	}
	// If no output extension is specified, use original extension
	// However, if the original extension does not correspond to output, return error
	if (!reqOption.toExtension) {
		if (allowedToExtensions.includes(fromExtension as AllowedToExtension)) {
			reqOption.toExtension = fromExtension as AllowedToExtension;
		} else {
			return { errorMessage: 'Please specify output file extension.' };
		}
	}
	const toContentType = imageExtensionMIME[reqOption.toExtension];
	if (!toContentType) {
		return { errorMessage: 'Please specify output file extension.' };
	}

	const isFromVector = vectorFileExtensions.includes(fromExtension as VectorFileExtension);
	const isToVector = vectorFileExtensions.includes(reqOption.toExtension as VectorFileExtension);

	let imageBuffer;
	if (!isFromVector && isToVector) {
		return { errorMessage: "Can't convert raster to vector." };
	} else if (isFromVector && isToVector) {
		// No resize if vector
		imageBuffer = file;
	} else {
		let image;
		switch (contentType) {
			case 'image/vnd.microsoft.icon':
				const pngImages = sharpsFromIco(Buffer.from(file), undefined, true) as ImageDataIco[];
				const pngImage = getLargestImageFromIco(pngImages ?? []);
				if (pngImage?.image) {
					image = pngImage.image;
				}
				break;
			case 'image/bmp':
				image = sharpFromBmp(Buffer.from(file)) as sharp.Sharp;
				break;
			default:
				image = sharp(file);
		}
		if (!image) {
			return { errorMessage: `Can't read image (as ${contentType}).` };
		}

		if (reqOption.width || reqOption.height) {
			image = image.resize({
				width: reqOption.width || undefined,
				height: reqOption.height || undefined,
				fit: reqOption.fit
			});
		}
		switch (reqOption.toExtension) {
			case 'jpg':
			case 'jpeg':
				if (!['jpg', 'jpeg'].includes(fromExtension) || reqOption.quality !== 100) {
					image = image
						.flatten({ background: { r: 255, g: 255, b: 255 } })
						.jpeg({ quality: reqOption.quality, progressive: true });
				}
				break;
			case 'png':
				if (fromExtension !== 'png' || reqOption.quality !== 100) {
					image = image.png({ quality: reqOption.quality, palette: true, progressive: true });
				}
				break;
			case 'gif':
				if (fromExtension !== 'gif') {
					image = image.gif();
				}
				break;
			case 'webp':
				if (fromExtension !== 'webp' || reqOption.quality !== 100) {
					image = image.webp({ quality: reqOption.quality });
				}
				break;
			case 'avif':
				if (fromExtension !== 'avif' || reqOption.quality !== 100) {
					image = image.avif({ quality: reqOption.quality });
				}
				break;
		}
		if (isToVector) {
			imageBuffer = await image.toBuffer();
		} else {
			imageBuffer = await image.rotate().keepIccProfile().toBuffer();
		}
	}

	// Save the resized object to S3 bucket with appropriate object key
	// Object key contains the filename twice
	// First: To list all variants of the same file name
	// Second: To specify the download file name
	const { error: uploadFileError } = await uploadFile(
		imageBuffer,
		toContentType,
		env.AWS_DEFAULT_REGION,
		transfer.storageCdnBucketName,
		`${reqOption.prefix}/${reqOption.imageName}/${optionParam.toString()}/${reqOption.imageName}`
	);
	if (uploadFileError) {
		return { errorMessage: 'Exception while saving resized image.' };
	}

	return { image: imageBuffer, contentType: toContentType };
}
