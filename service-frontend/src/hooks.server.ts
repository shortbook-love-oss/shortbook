import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n/i18n';
import { getSessionToken } from '$lib/utilities/cookie';
import { handle as handleAuth } from './auth';

const handleUser: Handle = async function ({ event, resolve }) {
	let session = null;
	if (getSessionToken(event.cookies)) {
		session = await event.locals.auth();
	}
	event.locals.session = session;

	return resolve(event);
};

export const handle = sequence(i18n.handle(), handleAuth, handleUser);
