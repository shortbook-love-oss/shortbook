import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { imageMIMEextension, maybeSvgMIMEs } from '$lib/utilities/file';

export async function isEnableImageFile(file: Uint8Array) {
	try {
		sharp(file).resize({ width: 1, height: 1, fit: 'cover' }).jpeg({ quality: 10 });
	} catch {
		return false;
	}
	return true;
}

export async function imageSecureCheck(file: Uint8Array) {
	// Prevent uploading of broken and unviewable image files
	const isEnableImage = await isEnableImageFile(file);
	if (!isEnableImage) {
		return { errorMessage: 'Please specify the image file.' };
	}

	// Browsers trust filename extensions, but this is a security issue
	// Check actual file type
	let fileTypeActual = await fileTypeFromBuffer(file);

	// file-type module outputs SVG MIME-type as "application/xml"
	if (fileTypeActual && maybeSvgMIMEs.includes(fileTypeActual.mime)) {
		return { mimeType: 'image/svg+xml' };
	}
	if (!fileTypeActual || !Object.keys(imageMIMEextension).includes(fileTypeActual.mime)) {
		return { errorMessage: 'Please specify the image file.' };
	}

	// If enable file, return as-is
	return { mimeType: fileTypeActual.mime };
}
