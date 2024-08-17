import { redirect } from '@sveltejs/kit';
import { callbackParam, setLanguageTagToPath } from '$lib/utilities/url';

// "/zh-cn/mypage" → "/de/signup?callbackUrl=https%3A%2F%2Fshortbook.life%2Fde%2Fmypage"
// Support redirect from subdomain
export function redirectToSignInPage(fromUrl: URL) {
	const redirectToPathname = setLanguageTagToPath('/signup', fromUrl);
	const redirectTo = new URL(fromUrl.origin + redirectToPathname);
	redirectTo.searchParams.set(callbackParam, fromUrl.href);

	redirect(303, redirectTo.href);
}
