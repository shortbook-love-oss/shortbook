import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { imageMIMEextension, maybeIcoMIMEs, maybeSvgMIMEs } from '$lib/utilities/file';

export async function isEnableImageFile(image: Uint8Array) {
	try {
		await sharp(image).resize({ width: 1, height: 1 }).jpeg({ quality: 10 }).toBuffer();
	} catch {
		return false;
	}
	return true;
}

export async function getActualImageData(image: Uint8Array) {
	// Browsers trust filename extensions, but this is a security issue
	// Check actual file type
	const fileTypeActual = await fileTypeFromBuffer(image);

	// Prevent uploading of broken and unviewable image files
	const isEnableImage = await isEnableImageFile(image);
	if (!isEnableImage) {
		return { errorMessage: 'Please specify the image file.' };
	}

	if (fileTypeActual && Object.keys(imageMIMEextension).includes(fileTypeActual.mime)) {
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
		} else if (maybeIcoMIMEs.includes(fileTypeActual.mime)) {
			// file-type module outputs SVG MIME-type as "image/x-icon"
			mimeType = 'image/vnd.microsoft.icon';
			extension = 'ico';
		}
		return {
			image,
			width: metadata.width,
			height: metadata.height,
			mimeType,
			extension
		};
	} else {
		return { errorMessage: 'Please specify the image file.' };
	}
}
