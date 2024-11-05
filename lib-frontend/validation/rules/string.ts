// Invisible ... Zero-width space (\u{200B}・\u{2060})
// Invisible ... Unicode control (\u{0000}-\u{001F}・\u{007F})
export function validateOnlyVisibleChar(value: string) {
	if (!value) {
		return true;
	}
	const visibleChars = value.match(/[^\s\u{200B}\u{2060}\u{0000}-\u{001F}\u{007F}]/gu);
	return !!visibleChars;
}

export function validateColor(value: string) {
	return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

export function validAsJson(value: string) {
	try {
		JSON.parse(value);
		return true;
	} catch {
		return false;
	}
}
