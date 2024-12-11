import { redirect } from '@sveltejs/kit';
import { redirectParam, setLanguageTagToPath } from '$lib/utilities/url';

// "/zh-cn/mypage" → "/de/signup?redirect-to=%2Fde%2Fmypage"
// Support redirect from subdomain
export function redirectToSignInPage(fromUrl: URL) {
	const redirectToPathname = setLanguageTagToPath('/signup', fromUrl);
	const redirectTo = new URL(fromUrl.origin + redirectToPathname);
	redirectTo.searchParams.set(redirectParam, fromUrl.href);

	redirect(303, redirectTo.href);
}
