import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n/i18n';
import { setAuthUserId, getAuthUserId } from '$lib/utilities/server/crypto';
import { setUserId, getSessionToken } from '$lib/utilities/cookie';
import { handle as handleAuth } from './auth';

const handleUser: Handle = async function ({ event, resolve }) {
	let session = null;
	if (getSessionToken(event.cookies)) {
		session = await event.locals.auth();
	}
	event.locals.session = session;

	if (session?.user) {
		// To reduce the load, set only signed-up or switched users
		const cookieUserId = getAuthUserId(event.cookies);
		if (session?.user.id !== cookieUserId) {
			setUserId(event.cookies, session.user.id ?? '');
			setAuthUserId(event.cookies, session.user.id ?? '');
		}
	}

	return resolve(event);
};

export const handle = sequence(i18n.handle(), handleAuth, handleUser);
