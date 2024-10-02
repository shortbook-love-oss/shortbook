import { error } from '@sveltejs/kit';
import {
	convertAndDeliver,
	isValidDistributionRequest
} from '$lib-backend/functions/api/image/deliver';
import type { ImageConvertOption } from '$lib-backend/utilities/infrastructure/image';

export async function POST({ request }) {
	const reqOption: ImageConvertOption = await request.json();
	const isValidRequest = isValidDistributionRequest(reqOption);
	if (isValidRequest !== true) {
		return error(400, { message: 'Bad request.' });
	}

	const { image, contentType, errorMessage } = await convertAndDeliver(reqOption);
	if (!image || !contentType || errorMessage) {
		return error(500, { message: errorMessage ?? '' });
	}

	const response = new Response(image);
	response.headers.set('content-type', contentType);
	return response;
}
