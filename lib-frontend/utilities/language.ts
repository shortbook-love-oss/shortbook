import { sourceLanguageTag, availableLanguageTags } from '$lib/i18n/paraglide/runtime';
import { getLangTag } from '$lib/utilities/url';

type AvailableLanguageTags = (typeof availableLanguageTags)[number];

export interface LanguageSelect {
	value: AvailableLanguageTags | '';
	text: string;
	english: string;
}

export const languageSelect: LanguageSelect[] = [
	{ value: 'en', text: 'English', english: 'English' },
	{ value: 'ja', text: '日本語', english: 'Japanese' },
	{ value: 'ar-ae', text: 'العربية (الإمارات العربية المتحدة)', english: 'Arabic (U.A.E.)' },
	{ value: 'fr', text: 'Français', english: 'French' },
	{ value: 'de', text: 'Deutsch', english: 'German' },
	{ value: 'es', text: 'Español', english: 'Spanish' },
	{ value: 'it', text: 'Italiano', english: 'Italian' },
	{ value: 'pt-br', text: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
	{ value: 'hi', text: 'हिन्दी', english: 'Hindi' },
	{ value: 'zh-cn', text: '简体字', english: 'Chinese (Beijing)' },
	{ value: 'zh-tw', text: '繁體字', english: 'Chinese (Taiwan)' },
	{ value: 'ko', text: '한국어', english: 'Korean' },
	{ value: 'ru', text: 'Русский язык', english: 'Russian' }
];

export const languageAndNotSelect: LanguageSelect[] = [
	{ value: '', text: 'Select your language', english: 'Select your language' },
	...languageSelect
];

export function isLanguageTag(maybeLangTag: string) {
	return availableLanguageTags.includes(maybeLangTag as AvailableLanguageTags);
}

export function guessNativeLangFromRequest(request: Request) {
	// e.g. "/ja/mypage" → ja
	let textLang = getLangTag(new URL(request.url).pathname);
	if (!textLang) {
		// e.g. reqAcceptLang = "ja,en-US;q=0.9,en;q=0.8,ar;q=0.7,ru;q=0.6,zh-CN;q=0.5,zh;q=0.4,sv;q=0.3"
		const reqAcceptLang = request.headers.get('Accept-Language');
		// e.g. acceptLangs = ["ja", "en-US", "en", "ar", "ru", "zh-CN", "zh", "sv"]
		const acceptLangs = (reqAcceptLang || '').match(/[a-zA-Z-]{2,5}/g);
		if (acceptLangs) {
			for (const acceptLang of acceptLangs) {
				if (isLanguageTag(acceptLang)) {
					textLang = acceptLang;
					break;
				}
			}
		}
	}

	return textLang || sourceLanguageTag;
}
