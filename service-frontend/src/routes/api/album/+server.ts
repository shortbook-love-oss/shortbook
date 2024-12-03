import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { AlbumImageGetResult, AlbumImageItem } from '$lib/utilities/album';
import { imageMIMEextension } from '$lib/utilities/file';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import { schema as listSchema } from '$lib/validation/schema/user/album/image-list';
import { uploadToAlbum } from '$lib-backend/functions/service/album/upload';
import { dbUserAlbumImageList } from '$lib-backend/model/user/album/image-list';
import { getExtensionForAll } from '$lib-backend/utilities/infrastructure/image';

export async function GET({ url, locals }) {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const searchParams = Object.fromEntries(url.searchParams);
	const req = await superValidate(searchParams, zod(listSchema));
	if (!req.valid) {
		const errorReasons = Object.values(req.errors).flat().join(', ');
		return error(400, { message: `Bad request. ${errorReasons ?? ''}` });
	}
	const reqCreatedBefore = req.data['created-before'];

	const { albumImages, count, dbError } = await dbUserAlbumImageList({
		userId: signInUser.id,
		limit: req.data.limit,
		page: req.data.page,
		// Prevent shifting even if page load → add images → paging
		createdBefore: reqCreatedBefore != undefined ? new Date(reqCreatedBefore) : undefined
	});
	if (!albumImages || count == undefined || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}

	const list = albumImages.map((albumImage) => {
		const fromExtension = imageMIMEextension[albumImage.property?.mime_type ?? ''] ?? '';
		const item: AlbumImageItem = {
			id: albumImage.id,
			userId: albumImage.user_id,
			name: albumImage.name,
			alt: albumImage.alt,
			languageInImage: albumImage.language_in_image as AvailableLanguageTags | '',
			savedFileName: albumImage.property?.saved_file_name ?? '',
			byteLength: albumImage.property?.byte_length ?? 0,
			width: albumImage.property?.width ?? 0,
			height: albumImage.property?.height ?? 0,
			toExtension: getExtensionForAll(fromExtension)
		};
		return item;
	});

	const responseData: AlbumImageGetResult = {
		albumImages: list,
		count
	};
	const response = new Response(JSON.stringify(responseData));
	response.headers.set('content-type', 'application/json');
	return response;
}

function isValidPostRequest(req: FormData) {
	const reqFiles = req.getAll('images');
	if (!reqFiles.every((file) => file instanceof File)) {
		return false;
	}
	return reqFiles;
}

export async function POST({ request, locals }) {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const req = await request.formData();
	const reqFiles = isValidPostRequest(req);
	if (reqFiles === false) {
		return error(400, { message: 'Bad request.' });
	}

	const { fileResults, errorMessage } = await uploadToAlbum(reqFiles, signInUser.id);
	if (!fileResults || errorMessage) {
		return error(500, { message: errorMessage });
	}

	const response = new Response(JSON.stringify({ fileResults }));
	response.headers.set('content-type', 'application/json');
	return response;
}
