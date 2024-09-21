import { i18n } from '$i18n/init';
import type { AvailableLanguageTags } from '$lib/utilities/language';

export const callbackParam = 'callbackUrl';
export const paymentBookInfoParam = 'bookInfo';
export const paymentSessionIdParam = 'sessionId';
export const signConfirmTokenParam = 'enjoyYourShortBookLife';
export const emailChangeTokenParam = 'token';
export const paymentCurrencyParam = 'currency';
export const inquiryCategoryParam = 'category';

// "/de/mypage/personnel" → "de"
// "/mypage/personnel" → "en"
// "/de" → "de"
export function getLanguageTagFromUrl(url: URL): AvailableLanguageTags {
	return i18n.getLanguageFromUrl(url);
}

// de: "/mypage" → "/de/mypage"
// en: "/mypage" → "/mypage"
export function setLanguageTagToPath(pathname: string, languageTag: AvailableLanguageTags | URL) {
	if (languageTag instanceof URL) {
		return i18n.resolveRoute(pathname, getLanguageTagFromUrl(languageTag));
	} else {
		return i18n.resolveRoute(pathname, languageTag);
	}
}

// "/de/mypage/personnel" → "/mypage/personnel"
// "/mypage/personnel" → "/mypage/personnel"
// "/de" → "/"
export function removeLanguageTagFromPath(pathname: string) {
	return i18n.route(pathname);
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
