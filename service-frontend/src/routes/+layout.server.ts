import { ENCRYPT_PASSWORD_USER_ID, ENCRYPT_SALT } from '$env/static/private';
import { encrypt, setAuthUserId } from '$lib/utilities/server/crypto';
import { setUserId, getUserId } from '$lib/utilities/cookie';

export const load = async ({ cookies, locals }) => {
	const session = await locals.auth();

	if (session?.user) {
		// To reduce the load, set only signed-up or switched users
		if (session.user.id !== getUserId(cookies)) {
			const encrypted = encrypt(session.user.id ?? '', ENCRYPT_PASSWORD_USER_ID, ENCRYPT_SALT);
			setUserId(cookies, session.user.id ?? '');
			setAuthUserId(cookies, encrypted);
		}
	}

	return {
		session
	};
};
