import { redirectToSignInPage } from '$lib-backend/utilities/url';

export const load = async ({ locals, url }) => {
	if (!locals.signInUser) {
		redirectToSignInPage(url);
	}

	return {
		isMypage: true
	};
};
