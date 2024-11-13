'use strict';

import { fetchByJson } from '$lib-backend/utilities/infrastructure/fetch';
import type { ImageConvertOption } from '$lib-backend/utilities/infrastructure/image';
import { env } from './env';

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
	const { data, contentType, error } = await fetchByJson<Buffer>(
		`${env.PUBLIC_ORIGIN}/api/image/deliver`,
		reqOption
	);

	if (!data || error) {
		return { errorMessage: error.message };
	}
	return { image: Buffer.concat(data), contentType };
}
