import { redirect } from '@sveltejs/kit';
import { callbackParam, getSafetyUrl } from '$lib/utilities/url.js';

export async function load({ locals, url }) {
	const session = await locals.auth();

	const maybeCallbackUrl = url.searchParams.get(callbackParam) ?? '';
	const callbackUrl = getSafetyUrl(maybeCallbackUrl, url.origin);
	if (session?.user) {
		// This page will not be displayed even if a signed-in user goes back in history
		redirect(303, getSafetyUrl(callbackUrl.href, url.origin));
	}
	if (!URL.canParse(maybeCallbackUrl) || new URL(maybeCallbackUrl).origin !== url.origin) {
		const redirectTo = new URL(url);
		redirectTo.searchParams.set(callbackParam, url.origin);
		redirect(303, redirectTo.href);
	}

	return { callbackUrl: callbackUrl.href };
}
