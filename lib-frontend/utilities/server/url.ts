import { redirect } from '@sveltejs/kit';
import { callbackParam, getLangTagPathPart } from '$lib/utilities/url';

// "/zh-cn/mypage" → "/de/signup?callbackUrl=https%3A%2F%2Fshortbook.life%2Fde%2Fmypage"
export function redirectToSignInPage(url: URL) {
	let redirectToPathname = getLangTagPathPart(url.pathname) + '/signup';
	const redirectTo = new URL(url.origin + redirectToPathname);
	redirectTo.searchParams.set(callbackParam, url.href);
	redirect(303, redirectTo.href);
}
