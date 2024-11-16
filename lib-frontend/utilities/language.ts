import { availableLanguageTags } from '$i18n/output/runtime';
import type { SelectItemSingle } from '$lib/utilities/select';

export type AvailableLanguageTags = (typeof availableLanguageTags)[number];

export interface LanguageSelect extends SelectItemSingle<AvailableLanguageTags | ''> {
	english: string;
}

export const languageSelect: LanguageSelect[] = [
	{ value: 'en', label: 'English', english: 'English' },
	{ value: 'ar-ae', label: 'العربية (الإمارات العربية المتحدة)', english: 'Arabic (U.A.E.)' },
	{ value: 'nb', label: 'Norsk bokmål', english: 'Danish' },
	{ value: 'nn', label: 'Norsk nynorsk', english: 'Norwegian (nynorsk)' },
	{ value: 'sv', label: 'Svenska', english: 'Swedish' },
	{ value: 'fi', label: 'Suomen kieli', english: 'Finnish' },
	{ value: 'es', label: 'Español', english: 'Spanish' },
	{ value: 'fr', label: 'Français', english: 'French' },
	{ value: 'de', label: 'Deutsch', english: 'German' },
	{ value: 'nl', label: 'Nederlands', english: 'Dutch' },
	{ value: 'it', label: 'Italiano', english: 'Italian' },
	{ value: 'uk', label: 'Українська мова', english: 'Ukrainian' },
	{ value: 'pt-br', label: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
	{ value: 'hi', label: 'हिन्दी', english: 'Hindi' },
	{ value: 'zh-cn', label: '简体字', english: 'Chinese (Beijing)' },
	{ value: 'zh-tw', label: '繁體字', english: 'Chinese (Taiwan)' },
	{ value: 'ja', label: '日本語', english: 'Japanese' },
	{ value: 'ko', label: '한국어', english: 'Korean' },
	{ value: 'id', label: 'Indonesia', english: 'Indonesian' },
	{ value: 'ru', label: 'Русский язык', english: 'Russian' }
];

export const languageAndNotSelect: LanguageSelect[] = [
	{ value: '', label: 'Select language', english: 'Select language' },
	...languageSelect
];
