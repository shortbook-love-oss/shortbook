import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env as envPublic } from '$env/dynamic/public';
import { i18n } from '$i18n/init';
import { getSessionToken } from '$lib/utilities/cookie';
import type { AvailableLanguageTags } from '$lib/utilities/language';
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
				penName: user.pen_name,
				email: user.email,
				imageSrc: envPublic.PUBLIC_ORIGIN_IMAGE_CDN + user.image_src,
				nativeLanguage: user.native_language_tag as AvailableLanguageTags
			};
		}
	}

	return resolve(event);
};

export const handle = sequence(i18n.handle(), handleUser);
