import { error } from '@sveltejs/kit';
import { uploadToAlbum } from '$lib-backend/functions/service/album/upload';

function isValidRequest(req: FormData | null) {
	if (!req) {
		return false;
	}
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
	const reqFiles = isValidRequest(req);
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
