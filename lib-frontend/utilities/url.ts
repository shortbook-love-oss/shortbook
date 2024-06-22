import { isAvailableLanguageTag } from '$lib/i18n/paraglide/runtime';

// "/de/mypage/personnel" → "/mypage/personnel"
// "/mypage/personnel" → "/mypage/personnel"
// "/de" → "/"
export function removeLangTagFromPath(pathname: string) {
	const firstDirName = pathname.split('/')[1] ?? '';
	if (isAvailableLanguageTag(firstDirName)) {
		return pathname.slice(firstDirName.length + 1) || '/';
	} else {
		return pathname;
	}
}

// "/de/mypage/personnel" → "de"
// "/mypage/personnel" → ""
// "/de" → "de"
export function getLangTag(pathname: string) {
	const firstDirName = pathname.split('/')[1] ?? '';
	if (isAvailableLanguageTag(firstDirName)) {
		return firstDirName;
	} else {
		return '';
	}
}

// "/de/mypage/personnel" → "/de"
// "/mypage/personnel" → ""
// "/de" → "/de"
export function getLangTagPathPart(pathname: string) {
	const langTag = getLangTag(pathname);
	if (langTag) {
		return '/' + langTag;
	} else {
		return '';
	}
}
