import { availableLanguageTags } from '$i18n/output/runtime';
import type { SelectItemSingle } from '$lib/utilities/select';

export type AvailableLanguageTags = (typeof availableLanguageTags)[number];

export interface LanguageSelect extends SelectItemSingle<AvailableLanguageTags | ''> {
	english: string;
}

export const languageSelect: LanguageSelect[] = [
	{ value: 'en', label: 'English', english: 'English' },
	{ value: 'ar', label: 'اَلْعَرَبِيَّةُ', english: 'Arabic' },
	{ value: 'nb', label: 'Norsk bokmål', english: 'Norwegian (bokmål)' },
	{ value: 'sv', label: 'Svenska', english: 'Swedish' },
	{ value: 'fi', label: 'Suomen kieli', english: 'Finnish' },
	{ value: 'et', label: 'Eesti keel', english: 'Estonian' },
	{ value: 'es', label: 'Español', english: 'Spanish' },
	{ value: 'fr', label: 'Français', english: 'French' },
	{ value: 'it', label: 'Italiano', english: 'Italian' },
	{ value: 'nl', label: 'Nederlands', english: 'Dutch' },
	{ value: 'de', label: 'Deutsch', english: 'German' },
	{ value: 'da', label: 'Dansk', english: 'Danish' },
	{ value: 'cs', label: 'Čeština', english: 'Czech' },
	{ value: 'hu', label: 'Magyar nyelv', english: 'Hungarian' },
	{ value: 'uk', label: 'Українська мова', english: 'Ukrainian' },
	{ value: 'ru', label: 'Русский язык', english: 'Russian' },
	{ value: 'pt-br', label: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
	{ value: 'hi', label: 'हिन्दी', english: 'Hindi' },
	{ value: 'zh-cn', label: '简体字', english: 'Chinese (Beijing)' },
	{ value: 'zh-tw', label: '繁體字', english: 'Chinese (Taiwan)' },
	{ value: 'ja', label: '日本語', english: 'Japanese' },
	{ value: 'ko', label: '한국어', english: 'Korean' },
	{ value: 'id', label: 'Bahasa Indonesia', english: 'Indonesian' }
];

export const languageAndNotSelect: LanguageSelect[] = [
	{ value: '', label: 'Select language', english: 'Select language' },
	...languageSelect
];

export function getLanguageItem(langTag: AvailableLanguageTags | '') {
	return languageSelect.find((lang) => lang.value === langTag);
}
