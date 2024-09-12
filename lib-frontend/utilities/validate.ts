import { isAvailableLanguageTag } from '$lib/i18n/paraglide/runtime';

// Invisible ... Zero-width space (\u{200B}・\u{2060})
// Invisible ... Unicode control (\u{0000}-\u{001F}・\u{007F})
export function validateOnlyVisibleChar(value: string) {
	if (!value) {
		return true;
	}
	const visibleChars = value.match(/[^\s\u{200B}\u{2060}\u{0000}-\u{001F}\u{007F}]/gu);
	return !!visibleChars;
}

export function validateOptionalLanguageTag(value: string) {
	if (!value) {
		return true;
	}
	return isAvailableLanguageTag(value);
}

export function validateOptionalUrl(value: string) {
	if (!value) {
		return true;
	}
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
}
