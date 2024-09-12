import { error, redirect } from '@sveltejs/kit';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { dbUserAlbumImageDelete } from '$lib-backend/model/user/album/image-delete';

export const actions = {
	default: async ({ request, url, params, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
    }

		const requestLang = getLanguageTagFromUrl(url);

		const { dbError } = await dbUserAlbumImageDelete({
			userId: userId,
			imageId: params.imageId
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		const afterUrl = new URL(url.origin + setLanguageTagToPath(`/mypage/asset/album`, requestLang));
		redirect(303, afterUrl.href);
	}
};
