import { error } from '@sveltejs/kit';
import { dbUserGetByKeyName } from '$lib/model/user/get-by-key-name';
import { getAuthUserId } from '$lib/utilities/server/cookie';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

export const load = async ({ params, request, cookies }) => {
	const { user, dbError } = await dbUserGetByKeyName({ keyName: params.keyName });
	if (!user || !user.profiles || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const requestLang = guessNativeLangFromRequest(request);

	let profileLang = user.profiles.languages.find((lang) => lang.language_code === requestLang);
	if (!profileLang && user.profiles.languages.length) {
		profileLang = user.profiles.languages[0];
	}

	const loginUserId = getAuthUserId(cookies);
	const isOwn = user.id === loginUserId;

	return { user, profileLang, isOwn };
};
