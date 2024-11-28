import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { sharpFromBmp, type ImageData as ImageDataBmp } from 'sharp-bmp';
import { sharpsFromIco, type ImageData as ImageDataIco } from 'sharp-ico';
import { imageMIMEextension, maybeSvgMIMEs } from '$lib/utilities/file';

export async function isEnableImageFile(image: Uint8Array) {
	try {
		await sharp(image).resize({ width: 1, height: 1 }).jpeg({ quality: 10 }).toBuffer();
	} catch {
		return false;
	}
	return true;
}

export type ActualImageDataSuccess = {
	image: Uint8Array;
	byteLength: number;
	width: number;
	height: number;
	mimeType: string;
	extension: string;
	errorMessage?: never;
};
export type ActualImageDataError = {
	image?: never;
	byteLength?: never;
	width?: never;
	height?: never;
	mimeType?: never;
	extension?: never;
	errorMessage: string;
};

export async function getActualImageData(
	image: Uint8Array
): Promise<ActualImageDataSuccess | ActualImageDataError> {
	// Browsers trust filename extensions, but this is a security issue
	// Check actual file type
	const fileTypeActual = await fileTypeFromBuffer(image);

	// Prevent uploading of broken and unviewable image files
	const isEnableImage = await isEnableImageFile(image);
	// Image enable check for .ico & .bmp (sharp is unsupported it)
	if (!isEnableImage && fileTypeActual?.mime === 'image/x-icon') {
		const pngImages = sharpsFromIco(Buffer.from(image), undefined, true) as ImageDataIco[];
		const pngImage = getLargestImageFromIco(pngImages ?? []);
		if (pngImage) {
			return {
				image,
				byteLength: image.byteLength,
				width: pngImage.width,
				height: pngImage.height,
				mimeType: 'image/vnd.microsoft.icon',
				extension: fileTypeActual.ext
			};
		}
	} else if (!isEnableImage && fileTypeActual?.mime === 'image/bmp') {
		const bmpImage = sharpFromBmp(Buffer.from(image), undefined, true) as ImageDataBmp;
		return {
			image,
			byteLength: image.byteLength,
			width: bmpImage.width,
			height: bmpImage.height,
			mimeType: fileTypeActual.mime,
			extension: fileTypeActual.ext
		};
	}
	if (!isEnableImage) {
		return { errorMessage: 'Please specify the image file.' };
	}

	// Image enable check for other format
	const allowMimeTypes = [...Object.keys(imageMIMEextension), ...maybeSvgMIMEs];
	if (fileTypeActual && allowMimeTypes.includes(fileTypeActual.mime)) {
		const metadata = await sharp(image).metadata();
		if (!metadata.width || !metadata.height) {
			return { errorMessage: "Can't get image size." };
		}
		let mimeType: string = fileTypeActual.mime;
		let extension: string = fileTypeActual.ext;
		if (maybeSvgMIMEs.includes(fileTypeActual.mime)) {
			// file-type module outputs SVG MIME-type as "application/xml"
			mimeType = 'image/svg+xml';
			extension = 'svg';
		}
		return {
			image,
			byteLength: image.byteLength,
			width: metadata.width,
			height: metadata.height,
			mimeType,
			extension
		};
	} else {
		return { errorMessage: 'Please specify the image file.' };
	}
}

export function getLargestImageFromIco(images: ImageDataIco[]) {
	let largestSize = 0;
	let largestIndex = 0;
	images.forEach((image, i) => {
		if (image.data.byteLength > largestSize) {
			largestSize = image.data.byteLength;
			largestIndex = i;
		}
	});

	return images.at(largestIndex);
}
