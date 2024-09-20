import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n/i18n';
import { getSessionToken } from '$lib/utilities/cookie';
import { dbUserGetBySessionToken } from '$lib-backend/model/user/get-by-session-token';

const handleUser: Handle = async function ({ event, resolve }) {
	event.locals.signInUser = null;

	const sessionToken = getSessionToken(event.cookies);
	if (sessionToken) {
		const { user } = await dbUserGetBySessionToken({ sessionToken });
		if (user) {
			event.locals.signInUser = {
				id: user.id,
				keyHandle: user.key_handle,
				name: user.name,
				email: user.email,
				imageSrc: user.image_src,
				nativeLanguage: user.native_language
			};
		}
	}

	return resolve(event);
};

export const handle = sequence(i18n.handle(), handleUser);
