import { redirectToSignInPage } from '$lib-backend/utilities/url';

export const load = async ({ locals, url }) => {
	if (!locals.session?.user) {
		redirectToSignInPage(url);
	}

	return {};
};
