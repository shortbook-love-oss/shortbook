import { redirectToSignInPage } from '$lib/utilities/server/url';

export const load = async ({ locals, url }) => {
	if (!locals.session?.user) {
		redirectToSignInPage(url);
	}

	return {};
};
