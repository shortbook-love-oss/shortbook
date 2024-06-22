import { error as kitError } from '@sveltejs/kit';
import { dbUserSessionGet } from '$lib/model/user/session/get';
import { getSessionToken, getUserId } from '$lib/utilities/cookie';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

const brandNames = {
	linkedin: 'LinkedIn',
	github: 'GitHub'
};

export const load = async ({ request, cookies }) => {
	const sessionToken = getSessionToken(cookies);
	const langTag = guessNativeLangFromRequest(request);

	const { user, session, error } = await dbUserSessionGet({
		userId: getUserId(cookies),
		sessionToken
	});
	if (error) {
		return kitError(500, {
			message: 'Server error: Failed to get user.'
		});
	}

	const providerNameLowercase = (user?.accounts[0].provider ?? '') as keyof typeof brandNames;
	const providerName = brandNames[providerNameLowercase] ?? '';
	const userCreatedAt = user?.created_at?.toLocaleString(langTag) ?? '';
	const lastSignedAt = session?.created_at?.toLocaleString(langTag) ?? '';

	return { providerName, userCreatedAt, lastSignedAt };
};
