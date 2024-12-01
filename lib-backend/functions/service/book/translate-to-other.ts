import type { AvailableLanguageTags } from '$lib/utilities/language';
import {
	translateHtmlContent,
	translateTextContent
} from '$lib-backend/functions/api/translate/translate';
import { dbBookContentGet } from '$lib-backend/model/book/content/get';

type TranslateContentResult = {
	title: string;
	subtitle: string;
	freeArea: string;
	salesArea: string;
};

export async function translateBookFreeContents(
	revisionId: string,
	inputLang: AvailableLanguageTags,
	outputLangs: AvailableLanguageTags[]
) {
	const { bookContent, dbError: dbBookGetError } = await dbBookContentGet({
		revisionId,
		targetLanguage: inputLang,
		isIncludeDelete: true
	});
	if (dbBookGetError) {
		throw dbBookGetError;
	} else if (!bookContent || dbBookGetError) {
		throw new Error(`Can't find book content. Book revision ID=${revisionId}`);
	}

	const results: Partial<Record<AvailableLanguageTags, TranslateContentResult>> = {};
	await Promise.all(
		outputLangs.map(async (outputLang) => {
			const langResult = await Promise.all([
				translateTextContent(bookContent.title, inputLang, outputLang),
				translateTextContent(bookContent.subtitle, inputLang, outputLang),
				translateHtmlContent(bookContent.free_area_html, inputLang, outputLang),
				translateHtmlContent(bookContent.sales_area_html, inputLang, outputLang)
			]).catch((e: Error) => {
				console.error(e);
				return null;
			});
			if (langResult != null) {
				results[outputLang] = {
					title: langResult[0],
					subtitle: langResult[1],
					freeArea: langResult[2],
					salesArea: langResult[3]
				};
			}
			return true;
		})
	).catch((e: Error) => {
		console.error(e);
		return null;
	});

	return results;
}
