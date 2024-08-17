import { error } from '@sveltejs/kit';
import { dbUserSessionGet } from '$lib/model/user/session/get';
import { getSessionToken } from '$lib/utilities/cookie';
import { signInProviders } from '$lib/utilities/signin';
import { getLanguageTagFromUrl } from '$lib/utilities/url';

export const load = async ({ url, cookies, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const sessionToken = getSessionToken(cookies);
	const langTag = getLanguageTagFromUrl(url);

	const { user, account, session, dbError } = await dbUserSessionGet({
		userId,
		sessionToken
	});
	if (dbError) {
		return error(500, { message: dbError.message });
	}

	const isSignedByEmail = !account;
	let signInProvider = null;
	for (const provider of signInProviders) {
		if (account?.provider === provider.key) {
			signInProvider = provider;
			break;
		}
	}
	const userCreatedAt = user?.created_at?.toLocaleString(langTag) ?? '';
	const lastSignedAt = session?.created_at?.toLocaleString(langTag) ?? '';

	return { isSignedByEmail, signInProvider, userCreatedAt, lastSignedAt };
};
