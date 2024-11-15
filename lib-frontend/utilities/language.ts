import { availableLanguageTags } from '$i18n/output/runtime';
import type { SelectItemSingle } from '$lib/utilities/select';

export type AvailableLanguageTags = (typeof availableLanguageTags)[number];

export interface LanguageSelect extends SelectItemSingle<AvailableLanguageTags | ''> {
	english: string;
}

export const languageSelect: LanguageSelect[] = [
	{ value: 'en', label: 'English', english: 'English' },
	{ value: 'ja', label: '日本語', english: 'Japanese' },
	{ value: 'ar-ae', label: 'العربية (الإمارات العربية المتحدة)', english: 'Arabic (U.A.E.)' },
	{ value: 'fr', label: 'Français', english: 'French' },
	{ value: 'de', label: 'Deutsch', english: 'German' },
	{ value: 'es', label: 'Español', english: 'Spanish' },
	{ value: 'it', label: 'Italiano', english: 'Italian' },
	{ value: 'pt-br', label: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
	{ value: 'hi', label: 'हिन्दी', english: 'Hindi' },
	{ value: 'zh-cn', label: '简体字', english: 'Chinese (Beijing)' },
	{ value: 'zh-tw', label: '繁體字', english: 'Chinese (Taiwan)' },
	{ value: 'ko', label: '한국어', english: 'Korean' },
	{ value: 'ru', label: 'Русский язык', english: 'Russian' }
];

export const languageAndNotSelect: LanguageSelect[] = [
	{ value: '', label: 'Select language', english: 'Select language' },
	...languageSelect
];
