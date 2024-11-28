import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { dbUserGetByKeyHandle } from '$lib-backend/model/user/get-by-key-handle';

export const load = async ({ url, params, locals }) => {
	const signInUser = locals.signInUser;
	const requestLang = getLanguageTagFromUrl(url);

	const { user, dbError } = await dbUserGetByKeyHandle({ keyHandle: params.userKey });
	if (!user || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	if (user.image_src) {
		user.image_src = envPublic.PUBLIC_ORIGIN_IMAGE_CDN + user.image_src;
	}

	let userLang = user.languages.find((lang) => lang.target_language === requestLang);
	if (!userLang && user.languages.length) {
		userLang = user.languages.at(0);
	}

	const isOwn = user.id === signInUser?.id;

	return { user, userLang, isOwn };
};
