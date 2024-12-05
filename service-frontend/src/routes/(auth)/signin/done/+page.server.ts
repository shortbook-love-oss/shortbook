import { error, redirect } from '@sveltejs/kit';
import { finalizeSign } from '$lib-backend/functions/service/auth/finalize-sign';
import { redirectParam, getSafetyUrl } from '$lib/utilities/url';

export async function load({ cookies, url, locals, getClientAddress }) {
	if (locals.signInUser) {
		// This page will not be displayed even if a signed-in user goes back in history
		return error(404, { message: 'Not found' });
	}

	// Commonize sign-in/up process
	const { error: finalizeError } = await finalizeSign(url, cookies, getClientAddress(), false);
	if (finalizeError) {
		return error(404, { message: finalizeError.message });
	}

	const maybeRedirectUrl = url.searchParams.get(redirectParam) ?? '';
	const redirectUrl = getSafetyUrl(maybeRedirectUrl, url.origin);

	redirect(303, redirectUrl);
}
