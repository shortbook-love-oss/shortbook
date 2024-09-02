import { error } from '@sveltejs/kit';
import { convertAndSave, isValidDistributionRequest } from '$lib/functions/api/image/distribution';
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

	const { image, contentType, errorMessage } = await convertAndSave(reqOption);
	if (!image || !contentType || errorMessage) {
		return error(500, { message: errorMessage ?? '' });
	}

	const response = new Response(image);
	response.headers.set('Content-Type', contentType);
	return response;
}
