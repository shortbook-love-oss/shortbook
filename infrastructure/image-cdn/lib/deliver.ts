'use strict';

import https from "https";
import { imageExtensionMIME, type ImageConvertOption } from './option';

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

export async function convertAndSave(
	reqOption: ImageConvertOption
): Promise<ResponseConvertAndSaveSuccess | ResponseConvertAndSaveError> {
	let contentType = '';
	let errorMessage = '';
	const image: Buffer | null = await new Promise((resolve, reject) => {
		const dataChunks: Buffer[] = [];
		const req = https.request('https://shortbook.life/api/image/deliver', {
			method: 'POST',
			headers: { 'content-type': 'application/json' }
		}, res => {
			res.on('data', (chunk: Buffer) => {
				dataChunks.push(chunk);
			});
			res.on('end', () => {
				contentType = imageExtensionMIME[reqOption.toExtension];
				resolve(Buffer.concat(dataChunks));
			});
		});
		req.on('error', (error: Error) => {
			console.error(`Error in image deliver API, reason: ${error.message}, request: ${JSON.stringify(reqOption)}`);
			errorMessage = error.message;
			reject(null);
		});
		req.write(JSON.stringify(reqOption));
		req.end();
	});

	if (!image || !contentType) {
		return { errorMessage };
	}

	return { image, contentType };
}
