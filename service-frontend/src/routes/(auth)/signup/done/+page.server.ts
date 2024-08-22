import { error, redirect } from '@sveltejs/kit';
import { finalizeSign } from '$lib/functions/service/auth/finalizeSign';
import { callbackParam, getSafetyUrl } from '$lib/utilities/url';

export async function load({ cookies, url, locals, getClientAddress }) {
	const session = await locals.auth();
	if (session?.user) {
		// This page will not be displayed even if a signed-in user goes back in history
		return error(404, { message: 'Not found' });
	}

	// Commonize sign-in/up process
	const { error: finalizeError } = await finalizeSign(url, cookies, getClientAddress(), true);
	if (finalizeError) {
		return error(404, { message: finalizeError.message });
	}

	const callbackUrl = getSafetyUrl(url.searchParams.get(callbackParam) ?? url.origin, url.origin);
	redirect(303, callbackUrl);
}
