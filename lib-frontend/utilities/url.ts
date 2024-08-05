import { isAvailableLanguageTag } from '$lib/i18n/paraglide/runtime';
import type { AvailableLanguageTags } from './language';

export const callbackParam = 'callbackUrl';
export const paymentBookInfoParam = 'bookInfo';
export const paymentSessionIdParam = 'sessionId';
export const signConfirmTokenParam = 'enjoy-shortbook';

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
