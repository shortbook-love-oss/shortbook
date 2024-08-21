import type { AvailableLanguageTags } from '$lib/utilities/language';

export function toLocaleDate(date: Date | null, lang: AvailableLanguageTags) {
	const now = new Date();
	if (!date) {
		return '';
	}

	// Aug 18
	const localeFormatOption: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric'
	};
	// Aug 18, 2024
	if (date.getFullYear() !== now.getFullYear()) {
		localeFormatOption.year = 'numeric';
	}

	return date.toLocaleDateString(lang, localeFormatOption);
}

export function toLocaleDatetime(date: Date | null | undefined, lang: AvailableLanguageTags) {
	const now = new Date();
	if (!date) {
		return '';
	}

	// Aug 18, 15:04:05
	const localeFormatOption: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		hour12: false,
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	};
	// Aug 18, 2024, 15:04:05
	if (date.getFullYear() !== now.getFullYear()) {
		localeFormatOption.year = 'numeric';
	}

	return date.toLocaleDateString(lang, localeFormatOption);
}
