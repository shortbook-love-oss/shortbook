import { redirectToSignInPage } from '$lib/utilities/url';

export const load = async ({ locals, url, cookies }) => {
	const session = await locals.auth();

	if (!session?.user) {
		redirectToSignInPage(url, cookies);
	}

	return {
		session
	};
};
