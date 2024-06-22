import { sourceLanguageTag, availableLanguageTags } from '$lib/i18n/paraglide/runtime';
import { getLangTag } from '$lib/utilities/url';

type AvailableLanguageTags = (typeof availableLanguageTags)[number];

export function isLanguageTag(maybeLangTag: string) {
	return availableLanguageTags.includes(maybeLangTag as AvailableLanguageTags);
}

export function guessNativeLangFromRequest(request: Request) {
	let nativeLang = getLangTag(new URL(request.url).pathname);
	if (!nativeLang) {
		// e.g. reqAcceptLang = "ja,en-US;q=0.9,en;q=0.8,ar;q=0.7,ru;q=0.6,zh-CN;q=0.5,zh;q=0.4,sv;q=0.3"
		const reqAcceptLang = request.headers.get('Accept-Language');
		// e.g. acceptLangs = ["ja", "en-US", "en", "ar", "ru", "zh-CN", "zh", "sv"]
		const acceptLangs = (reqAcceptLang || '').match(/[a-zA-Z-]{2,5}/g);
		if (acceptLangs) {
			for (const acceptLang of acceptLangs) {
				if (isLanguageTag(acceptLang)) {
					nativeLang = acceptLang;
					break;
				}
			}
		}
	}

	return nativeLang || sourceLanguageTag;
}
