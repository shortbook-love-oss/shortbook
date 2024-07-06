import { redirectToSignInPage } from '$lib/utilities/server/url';

export const load = async ({ locals, url, cookies }) => {
	if (!locals.session?.user) {
		redirectToSignInPage(url, cookies);
	}

	return {
		session: locals.session
	};
};
