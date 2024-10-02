import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { deleteFiles } from '$lib-backend/utilities/file';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { dbUserAlbumImageDelete } from '$lib-backend/model/user/album/image-delete';
import { dbUserAlbumImageGet } from '$lib-backend/model/user/album/image-get';

export const actions = {
	default: async ({ url, params, locals }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const requestLang = getLanguageTagFromUrl(url);

		const { dbError: dbDeleteError } = await dbUserAlbumImageDelete({
			userId: signInUser.id,
			imageId: params.imageId
		});
		if (dbDeleteError) {
			return error(500, { message: dbDeleteError.message });
		}

		const { albumImage, dbError: dbGetError } = await dbUserAlbumImageGet({
			imageId: params.imageId,
			isIncludeDelete: true
		});
		if (!albumImage?.property || dbGetError) {
			return error(500, { message: dbGetError?.message ?? '' });
		}

		const { error: deleteFileError } = await deleteFiles(
			env.AWS_DEFAULT_REGION,
			`${env.AWS_BUCKET_IMAGE_USER_ALBUM}`,
			`${signInUser.id}/${albumImage.property.file_path}`
		);
		if (deleteFileError) {
			return error(500, { message: "Can't delete album image. Please contact us." });
		}
		// Path format in CDN bucket is /${userId}/album-xxxxxxx/${someoption-w-h-q...}/album-xxxxxxx
		// So delete /${userId}/*
		const { error: deleteFileCdnError } = await deleteFiles(
			env.AWS_DEFAULT_REGION,
			`${env.AWS_BUCKET_IMAGE_USER_ALBUM}-cdn`,
			`${signInUser.id}/${albumImage.property.file_path}`
		);
		if (deleteFileCdnError) {
			return error(500, { message: "Can't delete album image. Please contact us." });
		}

		const afterUrl = new URL(url.origin + setLanguageTagToPath(`/mypage/asset/album`, requestLang));
		redirect(303, afterUrl.href);
	}
};
