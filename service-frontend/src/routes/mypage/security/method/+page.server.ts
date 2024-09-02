import { error } from '@sveltejs/kit';
import { dbUserSessionGet } from '$lib-backend/model/user/session/get';
import { getSessionToken } from '$lib/utilities/cookie';
import { signInProviders } from '$lib/utilities/signin';

export const load = async ({ cookies, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const sessionToken = getSessionToken(cookies);

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
	const userCreatedAt = user?.created_at;
	const lastSignedAt = session?.created_at;

	return { isSignedByEmail, signInProvider, userCreatedAt, lastSignedAt };
};
