import { error, redirect } from '@sveltejs/kit';
import { deleteSessionToken, getSessionToken } from '$lib/utilities/cookie';
import { callbackParam, getSafetyUrl } from '$lib/utilities/url';
import { dbUserSessionDelete } from '$lib-backend/model/user/session/delete';

export async function load(event) {
	const maybeCallbackUrl = event.url.searchParams.get(callbackParam) ?? '';
	const callbackUrl = getSafetyUrl(maybeCallbackUrl, event.url.origin);

	const sessionToken = getSessionToken(event.cookies);
	if (!sessionToken) {
		redirect(303, callbackUrl);
	}
	deleteSessionToken(event.cookies);

	// Delete session from DB
	const { dbError } = await dbUserSessionDelete({ sessionToken });
	if (dbError) {
		error(500, dbError.message);
	}

	redirect(303, callbackUrl);
}
