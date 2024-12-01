import type { AvailableLanguageTags } from '$lib/utilities/language';

export async function translateTextContent(
	content: string,
	inputLang: AvailableLanguageTags,
	outputLang: AvailableLanguageTags
) {
	return translateByDeepL(content, inputLang, outputLang, 'text');
}

export async function translateHtmlContent(
	content: string,
	inputLang: AvailableLanguageTags,
	outputLang: AvailableLanguageTags
) {
	return translateByDeepL(content, inputLang, outputLang, 'html');
}

function translateByDeepL(
	content: string,
	inputLang: AvailableLanguageTags,
	outputLang: AvailableLanguageTags,
	contentType: string
) {
	if (!content) {
		return '';
	}
	return content;
}
