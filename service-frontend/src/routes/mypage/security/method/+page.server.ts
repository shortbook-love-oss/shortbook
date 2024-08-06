import { error } from '@sveltejs/kit';
import { dbUserSessionGet } from '$lib/model/user/session/get';
import { getSessionToken } from '$lib/utilities/cookie';
import { guessNativeLangFromRequest } from '$lib/utilities/language';
import { signInProviders } from '$lib/utilities/signin';

export const load = async ({ request, cookies, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const sessionToken = getSessionToken(cookies);
	const langTag = guessNativeLangFromRequest(request);

	const { user, session, dbError } = await dbUserSessionGet({
		userId,
		sessionToken
	});
	if (dbError) {
		return error(500, { message: dbError.message });
	}

	let providerName = '';
	for (const provider of signInProviders) {
		if (provider.key === user?.accounts[0].provider) {
			providerName = provider.label;
			break;
		}
	}
	const userCreatedAt = user?.created_at?.toLocaleString(langTag) ?? '';
	const lastSignedAt = session?.created_at?.toLocaleString(langTag) ?? '';

	return { providerName, userCreatedAt, lastSignedAt };
};
