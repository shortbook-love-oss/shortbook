import { getLangTagPathPart } from '$lib/utilities/url.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	const session = await locals.auth();

	if (!session?.user) {
		// '/zh-cn/mypage' → '/de/signin?callbackUrl=https%3A%2F%2Fshortbook.life%2Fde%2Fmypage'
		const redirectTo = new URL(`${url.origin}${getLangTagPathPart(url.pathname)}/signin`);
		redirectTo.searchParams.set('callbackUrl', url.href);
		throw redirect(303, redirectTo.href);
	}

	return {
		session
	};
};
