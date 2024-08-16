import { error } from '@sveltejs/kit';
import { dbUserGetByKeyName } from '$lib/model/user/get-by-key-name';
import { getLanguageTagFromUrl } from '$lib/utilities/url';

export const load = async ({ url, params, locals }) => {
	const { user, dbError } = await dbUserGetByKeyName({ keyName: params.userKey });
	if (!user || !user.profiles || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	let profileLang = user.profiles.languages.find((lang) => lang.language_code === requestLang);
	if (!profileLang && user.profiles.languages.length) {
		profileLang = user.profiles.languages[0];
	}

	const loginUserId = locals.session?.user?.id;
	const isOwn = user.id === loginUserId;

	return { user, profileLang, isOwn };
};
