import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { dbUserGetByKeyName } from '$lib/model/user/get-by-key-name';
import { getLanguageTagFromUrl } from '$lib/utilities/url';

export const load = async ({ url, params, locals }) => {
	const signInUserId = locals.session?.user?.id;
	const requestLang = getLanguageTagFromUrl(url);

	const { user, dbError } = await dbUserGetByKeyName({ keyName: params.userKey });
	if (!user || !user.profiles || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	if (user.image) {
		user.image = envPublic.PUBLIC_ORIGIN_IMAGE_CDN + user.image;
	}

	let profileLang = user.profiles.languages.find((lang) => lang.language_code === requestLang);
	if (!profileLang && user.profiles.languages.length) {
		profileLang = user.profiles.languages[0];
	}

	const isOwn = user.id === signInUserId;

	return { user, profileLang, isOwn };
};
