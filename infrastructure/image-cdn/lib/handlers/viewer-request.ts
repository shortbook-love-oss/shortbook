'use strict';

import type { Handler } from 'aws-lambda';
import { imageBucketTransferKeys } from '$lib-backend/utilities/infrastructure/image';
import { decodeViewerRequestUri, optionToParam } from '../utilities';

export const handler: Handler = async (event, context, callback) => {
	const request = event.Records[0].cf.request;
	console.log(`viewer-request request.uri: ${request.uri}, querystring: ${request.querystring}`);

	const decodedUriObj = decodeViewerRequestUri(request.uri);
	if (!decodedUriObj) {
		callback(null, request);
		return;
	}

	// Not allowed start of uri
	if (!imageBucketTransferKeys.includes(decodedUriObj.transferKey)) {
		const errorMessage =
			`First directory name should specify one of ${imageBucketTransferKeys.join(', ')}. Not ${decodedUriObj.transferKey}.`;
		console.error(`${errorMessage} querystring: ${request.querystring}`);
		const errorResponse = {
			status: '500',
			headers: {
				'content-type': [{ key: 'content-type', value: 'text/plain' }]
			},
			body: errorMessage
		};
		callback(null, errorResponse);
		return;
	}

	const { toExtension, width, height, fit, quality } = optionToParam(request.querystring);
	const decodedParam = new URLSearchParams();
	decodedParam.set('ext', toExtension);
	decodedParam.set('w', String(width));
	decodedParam.set('h', String(height));
	decodedParam.set('fit', fit);
	decodedParam.set('q', String(quality));

	const convertedUri = `/${decodedUriObj.transferKey}/${decodedUriObj.prefix
		}/${decodedParam.toString()}/${decodedUriObj.imageName}`;
	request.uri = convertedUri;
	request.querystring = decodedParam.toString();

	callback(null, request);
};
