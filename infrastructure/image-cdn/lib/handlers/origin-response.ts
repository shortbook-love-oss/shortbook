'use strict';

import type { Handler } from 'aws-lambda';
import { convertAndSave } from 'lib/deliver';
import { decodeOriginResponseUri } from '../utilities';

export const handler: Handler = async (event, context, callback) => {
	const request = event.Records[0].cf.request;
	const response = event.Records[0].cf.response;
	console.log(`origin-response, request.uri: ${request.uri}, querystring: ${request.querystring}, response.status: ${response.status} (${typeof response.status})`);

	// Check if image is present
	if (![403, 404].includes(Number(response.status))) {
		// If exist cached image
		callback(null, response);
	}

	// If there is no parameters, just pass the response
	if (request.querystring === '') {
		callback(null, response);
		return;
	}

	// Read the required uri. Ex requestUri: /profile/abcdefg/current/ext={paramExtension}&w=${paramWidth}&h=${height}&fit=${paramFit}&q=${paramQuality}/image.origin.jpg
	const reqOption = decodeOriginResponseUri(request.uri);
	if (!reqOption) {
		console.error(`Can't parse convert option, requestUri: ${request.uri}, querystring: ${request.querystring}`);
		callback(null, response);
		return;
	}

	// Resize and change image format
	const { image, contentType, errorMessage } = await convertAndSave(reqOption);
	if (!image || !contentType) {
		console.error(`Error in convertAndSave func, errorMessage: ${errorMessage}, reqOption: ${JSON.stringify(reqOption)}`);
		callback(null, response);
		return;
	}

	// Generate a binary response with resized image
	response.status = 200;
	response.body = Buffer.from(image).toString('base64');
	response.bodyEncoding = 'base64';
	response.headers['content-type'] = [{ key: 'content-type', value: contentType }];

	callback(null, response);
};
