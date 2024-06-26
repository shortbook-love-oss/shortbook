import { redirect } from '@sveltejs/kit';
import { getUserId } from '$lib/utilities/cookie';
import { getLangTagPathPart } from '$lib/utilities/url';

export const load = async ({ locals, url, cookies }) => {
	const session = await locals.auth();

	if (!session?.user) {
		// '/zh-cn/mypage' → '/de/signup?callbackUrl=https%3A%2F%2Fshortbook.life%2Fde%2Fmypage'
		let redirectToPathname = '/signup';
		if (getUserId(cookies)) {
			// "user-id" is set for devices where you have signed in
			redirectToPathname = '/signin';
		}
		const redirectTo = new URL(url.origin + getLangTagPathPart(url.pathname) + redirectToPathname);
		redirectTo.searchParams.set('callbackUrl', url.href);
		redirect(303, redirectTo.href);
	}

	return {
		session
	};
};
