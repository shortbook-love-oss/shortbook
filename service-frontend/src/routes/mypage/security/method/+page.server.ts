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

	const isSignedByEmail = !user?.accounts[0];
	let providerName = '';
	for (const provider of signInProviders) {
		if (user?.accounts[0]?.provider === provider.key) {
			providerName = provider.label;
			break;
		}
	}
	const userCreatedAt = user?.created_at?.toLocaleString(langTag) ?? '';
	const lastSignedAt = session?.created_at?.toLocaleString(langTag) ?? '';

	return { isSignedByEmail, providerName, userCreatedAt, lastSignedAt };
};
