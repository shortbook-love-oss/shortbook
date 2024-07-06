import { redirect } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { getAuthUserId } from './crypto';
import { callbackParam, getLangTagPathPart } from '../url';

// "/zh-cn/mypage" → "/de/signup?callbackUrl=https%3A%2F%2Fshortbook.life%2Fde%2Fmypage"
export function redirectToSignInPage(url: URL, cookies: Cookies) {
	let redirectToPathname = '/signup';
	if (getAuthUserId(cookies)) {
		// "user-id" is set for devices where you have signed in
		redirectToPathname = '/signin';
	}
	const redirectTo = new URL(url.origin + getLangTagPathPart(url.pathname) + redirectToPathname);
	redirectTo.searchParams.set(callbackParam, url.href);
	redirect(303, redirectTo.href);
}
