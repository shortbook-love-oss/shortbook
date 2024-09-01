import { error } from '@sveltejs/kit';
import Sharp from 'sharp';
import { env } from '$env/dynamic/private';
import {
	cdnTransferIndex,
	isValidDistributionRequest
} from '$lib/functions/api/image/distribution';
import { getFile, uploadFile } from '$lib/utilities/server/file';
import { imageMIMEextension } from '$lib/utilities/file';
import {
	vectorFileExtensions,
	type ImageConvertOption,
	type VectorFileExtension
} from '$lib/utilities/image';

export async function POST({ request }) {
	const reqOption: ImageConvertOption = await request.json();
	const isValidRequest = isValidDistributionRequest(reqOption);
	if (isValidRequest !== true) {
		return error(400, { message: 'Bad request.' });
	}
	if (
		!vectorFileExtensions.includes(reqOption.fromExtension as VectorFileExtension) &&
		vectorFileExtensions.includes(reqOption.toExtension as VectorFileExtension)
	) {
		return error(400, { message: "Can't convert raster to vector." });
	}

	const transfer = cdnTransferIndex[reqOption.transferKey];
	const isFromVector = vectorFileExtensions.includes(
		reqOption.fromExtension as VectorFileExtension
	);
	const isToVector = vectorFileExtensions.includes(reqOption.toExtension as VectorFileExtension);

	// Get the source image
	const {
		file,
		contentType,
		error: getFileError
	} = await getFile(
		env.AWS_REGION,
		transfer.storageBucketName,
		`${reqOption.prefix}/${reqOption.imageName}.${reqOption.fromExtension}`
	);
	if (getFileError || !file?.byteLength) {
		return error(500, { message: "Can't find original image." });
	}
	if (!Object.keys(imageMIMEextension).includes(contentType)) {
		return error(500, { message: 'The specified file is unsupported content type.' });
	}

	let imageBuffer;
	if (isFromVector && isToVector) {
		imageBuffer = file;
	} else {
		let image = Sharp(file);
		if ((reqOption.width || reqOption.height) && !isFromVector) {
			image = image.resize({
				width: reqOption.width || undefined,
				height: reqOption.height || undefined,
				fit: reqOption.fit
			});
		}
		switch (reqOption.toExtension) {
			case 'jpg':
			case 'jpeg':
				if (!['jpg', 'jpeg'].includes(reqOption.fromExtension) || reqOption.quality !== 100) {
					image = image.jpeg({ quality: reqOption.quality, progressive: true });
				}
				break;
			case 'png':
				if (reqOption.fromExtension !== 'png' || reqOption.quality !== 100) {
					image = image.png({ quality: reqOption.quality, progressive: true });
				}
				break;
			case 'gif':
				if (reqOption.fromExtension !== 'gif') {
					image = image.gif();
				}
				break;
			case 'webp':
				if (reqOption.fromExtension !== 'webp' || reqOption.quality !== 100) {
					image = image.webp({ quality: reqOption.quality });
				}
				break;
			case 'avif':
				if (reqOption.fromExtension !== 'avif' || reqOption.quality !== 100) {
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

	// Save the resized object to S3 bucket with appropriate object key.
	const optionParam = new URLSearchParams();
	optionParam.set('ext', reqOption.toExtension);
	optionParam.set('w', String(reqOption.width));
	optionParam.set('h', String(reqOption.height));
	optionParam.set('fit', reqOption.fit);
	optionParam.set('q', String(reqOption.quality));
	const { error: uploadFileError } = await uploadFile(
		imageBuffer,
		contentType,
		transfer.storageCdnRegion,
		transfer.storageCdnBucketName,
		`${reqOption.prefix}/${optionParam.toString()}/${reqOption.imageName}.${reqOption.toExtension}`,
		`max-age=${86400 * 14}`
	);
	if (uploadFileError) {
		console.log('Exception while saving resized image.', uploadFileError);
		return error(400, { message: 'Exception while saving resized image.' });
	}

	const response = new Response(imageBuffer);
	response.headers.set('Content-Type', contentType);
	return response;
}
