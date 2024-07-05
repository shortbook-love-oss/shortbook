import { redirect } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { isAvailableLanguageTag } from '$lib/i18n/paraglide/runtime';
import { getUserId } from './cookie';
import type { AvailableLanguageTags } from './language';

export const callbackParam = 'callbackUrl';

// "/de/mypage/personnel" → "/mypage/personnel"
// "/mypage/personnel" → "/mypage/personnel"
// "/de" → "/"
export function removeLangTagFromPath(pathname: string) {
	const firstDirName = pathname.split('/')[1] ?? '';
	if (isAvailableLanguageTag(firstDirName)) {
		return pathname.slice(firstDirName.length + 1) || '/';
	} else {
		return pathname;
	}
}

// "/de/mypage/personnel" → "de"
// "/mypage/personnel" → ""
// "/de" → "de"
export function getLangTag(pathname: string): AvailableLanguageTags | '' {
	const firstDirName = pathname.split('/')[1] ?? '';
	if (isAvailableLanguageTag(firstDirName)) {
		return firstDirName;
	} else {
		return '';
	}
}

// "/de/mypage/personnel" → "/de"
// "/mypage/personnel" → ""
// "/de" → "/de"
export function getLangTagPathPart(pathname: string) {
	const langTag = getLangTag(pathname);
	if (langTag) {
		return '/' + langTag;
	} else {
		return '';
	}
}

// "/zh-cn/mypage" → "/de/signup?callbackUrl=https%3A%2F%2Fshortbook.life%2Fde%2Fmypage"
export function redirectToSignInPage(url: URL, cookies: Cookies) {
	let redirectToPathname = '/signup';
	if (getUserId(cookies)) {
		// "user-id" is set for devices where you have signed in
		redirectToPathname = '/signin';
	}
	const redirectTo = new URL(url.origin + getLangTagPathPart(url.pathname) + redirectToPathname);
	redirectTo.searchParams.set(callbackParam, url.href);
	redirect(303, redirectTo.href);
}

// Preventing access to unexpected origin.
// "https://shortbook.life/de/write" → "https://shortbook.life/de/write"
// "https://iamshortbook.writer/books" (safeOrigin: "https://iamshortbook.writer") → "https://iamshortbook.writer/books"
// "https://evil.example/de/write" → "https://shortbook.life"
// "invalidURL" → "https://shortbook.life"
export function getSafetyUrl(url: string, safeOrigin: string) {
	try {
		const inputCallbackUrl = new URL(url);
		if (inputCallbackUrl.origin === safeOrigin) {
			return inputCallbackUrl;
		} else {
			return new URL(safeOrigin);
		}
	} catch {
		return new URL(safeOrigin);
	}
}
