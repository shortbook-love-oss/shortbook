import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { imageMIMEextension, maybeSvgMIMEs } from "$lib/utilities/file";

export async function isEnableImageFile(file: Uint8Array) {
	try {
		sharp(file).resize({ width: 1, height: 1, fit: 'cover' }).jpeg({ quality: 10 });
	} catch {
		return false;
	}
	return true;
}

export function convertSvgToRaster(vectorFile: Uint8Array, width: number, height: number) {
	return sharp(vectorFile)
		.resize({ width, height, fit: 'cover' })
		.flatten(false) // SVG no-bg to PNG alpha channel
		.png({ quality: 100, palette: true, progressive: true })
		.toBuffer();
}

export async function imageSecureCheck(file: Uint8Array, width: number, height: number) {
	// Prevent uploading of broken and unviewable image files
	const isEnableImage = await isEnableImageFile(file);
	if (!isEnableImage) {
		return { errorMessage: 'Please specify the image file.' };
	}

	// Browsers trust filename extensions, but this is a security issue
	// Check actual file type
	let fileTypeActual = await fileTypeFromBuffer(file);

	if (fileTypeActual && maybeSvgMIMEs.includes(fileTypeActual.mime)) {
		// Convert SVG to raster, because SVG has security issue about scripting
		const rasterImage = new Uint8Array(await convertSvgToRaster(file, width, height));
		return { image: rasterImage, mimeType: 'image/png' };
	} else if (!fileTypeActual || !Object.keys(imageMIMEextension).includes(fileTypeActual.mime)) {
		return { errorMessage: 'Please specify the image file.' };
	}

	// If enable raster file, return as-is
	return { image: file, mimeType: fileTypeActual.mime };
}
