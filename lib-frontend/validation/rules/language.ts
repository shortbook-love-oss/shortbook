import { isAvailableLanguageTag } from '$i18n/output/runtime';

export function validateOptionalLanguageTag(value: string) {
	if (!value) {
		return true;
	}
	return isAvailableLanguageTag(value);
}
