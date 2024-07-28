import {
	sourceLanguageTag,
	availableLanguageTags,
	isAvailableLanguageTag
} from '$lib/i18n/paraglide/runtime';
import { getLangTag } from '$lib/utilities/url';

export type AvailableLanguageTags = (typeof availableLanguageTags)[number];

export interface LanguageSelect {
	value: AvailableLanguageTags | '';
	label: string;
	english: string;
}

export const languageSelect: LanguageSelect[] = [
	{ value: 'en', label: 'English', english: 'English' },
	{ value: 'ja', label: '日本語', english: 'Japanese' },
	// { value: 'ar-ae', label: 'العربية (الإمارات العربية المتحدة)', english: 'Arabic (U.A.E.)' },
	// { value: 'fr', label: 'Français', english: 'French' },
	// { value: 'de', label: 'Deutsch', english: 'German' },
	// { value: 'es', label: 'Español', english: 'Spanish' },
	// { value: 'it', label: 'Italiano', english: 'Italian' },
	// { value: 'pt-br', label: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
	// { value: 'hi', label: 'हिन्दी', english: 'Hindi' },
	// { value: 'zh-cn', label: '简体字', english: 'Chinese (Beijing)' },
	// { value: 'zh-tw', label: '繁體字', english: 'Chinese (Taiwan)' },
	// { value: 'ko', label: '한국어', english: 'Korean' },
	// { value: 'ru', label: 'Русский язык', english: 'Russian' }
];

export const languageAndNotSelect: LanguageSelect[] = [
	{ value: '', label: 'Select your language', english: 'Select your language' },
	...languageSelect
];

export function guessNativeLangFromRequest(request: Request): AvailableLanguageTags {
	// e.g. "/ja/mypage" → ja
	let textLang = getLangTag(new URL(request.url).pathname);
	if (!textLang) {
		// e.g. reqAcceptLang = "ja,en-US;q=0.9,en;q=0.8,ar;q=0.7,ru;q=0.6,zh-CN;q=0.5,zh;q=0.4,sv;q=0.3"
		const reqAcceptLang = request.headers.get('Accept-Language');
		// e.g. acceptLangs = ["ja", "en-US", "en", "ar", "ru", "zh-CN", "zh", "sv"]
		const acceptLangs = (reqAcceptLang || '').match(/[a-zA-Z-]{2,5}/g);
		if (acceptLangs) {
			for (const acceptLang of acceptLangs) {
				if (isAvailableLanguageTag(acceptLang)) {
					textLang = acceptLang;
					break;
				}
			}
		}
	}

	return textLang || sourceLanguageTag;
}
