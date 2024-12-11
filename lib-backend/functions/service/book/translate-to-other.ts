import { v3 as gcTranslate } from '@google-cloud/translate';
import { Translator as deeplTranslator } from 'deepl-node';
import { env } from '$env/dynamic/private';
import { rewindArray } from '$lib/utilities/array';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import {
	deeplLangKeys,
	googleLangKeys,
	translateContentByDeepl,
	translateContentByGoogle,
	type DeeplLangKey,
	type GoogleLangKey
} from '$lib-backend/functions/api/translate/translate';
import {
	dbBookContentCreate,
	type DbBookContentCreateProp
} from '$lib-backend/model/book/content/create';
import { dbBookRevisionGetCompare } from '$lib-backend/model/book/revision/get-compare';
import { splitHtmlByTopLevelElements } from '$lib-backend/utilities/html';

type TranslateContentResult = {
	title: string;
	subtitle: string;
	freeArea: string;
	paidArea: string;
	salesArea: string;
};

function initTranslator() {
	const dTranslator = new deeplTranslator(env.DEEPL_TRANSLATE_API_KEY_SECRET);
	const gTranslator = new gcTranslate.TranslationServiceClient({
		credentials: {
			type: 'service_account',
			private_key: env.GOOGLE_TRANSLATE_SA_PRIVATE_KEY,
			client_email: env.GOOGLE_TRANSLATE_SA_CLIENT_EMAIL
		}
	});

	return { dTranslator, gTranslator };
}

export async function translateBookContents(
	latestRevisionId: string,
	sourceLang: AvailableLanguageTags,
	targetLangs: AvailableLanguageTags[]
) {
	// Revisions order is "latest to oldest"
	const {
		latestRevision,
		beforeRevision,
		dbError: dbBookGetError
	} = await dbBookRevisionGetCompare({
		newerRevisionId: latestRevisionId,
		statuses: [1],
		isIncludeDelete: true
	});
	if (dbBookGetError) {
		throw dbBookGetError;
	}
	const latestContent = latestRevision?.contents.find(
		(content) => content.language_tag === sourceLang
	);
	const beforeContent = beforeRevision?.contents.find(
		(content) => content.language_tag === beforeRevision.native_language_tag
	);
	if (latestRevision == undefined || latestContent == undefined) {
		throw new Error(
			`Can't find the book revision. revisionId=${latestRevisionId}, sourceLang=${sourceLang}`
		);
	}

	// Target of translation: Only lines that have changed since the previous revision are translated
	const freeAreaElements = splitHtmlByTopLevelElements(latestContent.free_area_html);
	let freeAreaFilteredElements = freeAreaElements;
	let freeAreaExcludeIndex = new Map<number, number>();
	const paidAreaElements = splitHtmlByTopLevelElements(latestContent.paid_area_html);
	let paidAreaFilteredElements = paidAreaElements;
	let paidAreaExcludeIndex = new Map<number, number>();
	const salesAreaElements = splitHtmlByTopLevelElements(latestContent.sales_area_html);
	let salesAreaFilteredElements = salesAreaElements;
	let salesAreaExcludeIndex = new Map<number, number>();

	// If accidentally select wrong native-language, the author would change it to the correct language
	// → Re-translate in all languages
	if (beforeContent && beforeRevision?.native_language_tag === latestRevision.native_language_tag) {
		const { filteredElements: filteredFreeElements, excludedIndex: excludedFreeIndex } =
			filteringHtmlContentShouldTranslate(
				freeAreaElements,
				splitHtmlByTopLevelElements(beforeContent.free_area_html)
			);
		freeAreaFilteredElements = filteredFreeElements;
		freeAreaExcludeIndex = excludedFreeIndex;

		const { filteredElements: filteredPaidElements, excludedIndex: excludedPaidIndex } =
			filteringHtmlContentShouldTranslate(
				paidAreaElements,
				splitHtmlByTopLevelElements(beforeContent.paid_area_html)
			);
		paidAreaFilteredElements = filteredPaidElements;
		paidAreaExcludeIndex = excludedPaidIndex;

		const { filteredElements: filteredSalesElements, excludedIndex: excludedSalesIndex } =
			filteringHtmlContentShouldTranslate(
				salesAreaElements,
				splitHtmlByTopLevelElements(beforeContent.sales_area_html)
			);
		salesAreaFilteredElements = filteredSalesElements;
		salesAreaExcludeIndex = excludedSalesIndex;
	}

	const { dTranslator, gTranslator } = initTranslator();

	const results = new Map<AvailableLanguageTags, TranslateContentResult>();
	await Promise.all(
		targetLangs.map(async (targetLang) => {
			let hasLangInBeforeRev = false;
			if (beforeRevision) {
				hasLangInBeforeRev = beforeRevision.contents.some(
					(content) => content.language_tag === targetLang
				);
			}

			const textTranslateContents = [latestContent.title, latestContent.subtitle];
			const htmlTranslateContents = hasLangInBeforeRev
				? [
						freeAreaFilteredElements.map((elem) => elem.outerHTML).join(''),
						paidAreaFilteredElements.map((elem) => elem.outerHTML).join(''),
						salesAreaFilteredElements.map((elem) => elem.outerHTML).join('')
					]
				: [
						freeAreaElements.map((elem) => elem.outerHTML).join(''),
						paidAreaElements.map((elem) => elem.outerHTML).join(''),
						salesAreaElements.map((elem) => elem.outerHTML).join('')
					];

			let langResults;
			// If translate into/from language that DeepL doesn't support, use Google Translate instead
			if (
				googleLangKeys.includes(sourceLang as GoogleLangKey) ||
				googleLangKeys.includes(targetLang as GoogleLangKey)
			) {
				langResults = await Promise.all<string[]>([
					translateContentByGoogle(
						textTranslateContents,
						gTranslator,
						sourceLang,
						targetLang,
						false
					),
					translateContentByGoogle(htmlTranslateContents, gTranslator, sourceLang, targetLang, true)
				]).catch((error: Error) => {
					console.error(error);
					return undefined;
				});
			} else if (
				deeplLangKeys.includes(sourceLang as DeeplLangKey) &&
				deeplLangKeys.includes(targetLang as DeeplLangKey)
			) {
				langResults = await Promise.all<string[]>([
					translateContentByDeepl(
						textTranslateContents,
						dTranslator,
						sourceLang as DeeplLangKey,
						targetLang as DeeplLangKey,
						false
					),
					translateContentByDeepl(
						htmlTranslateContents,
						dTranslator,
						sourceLang as DeeplLangKey,
						targetLang as DeeplLangKey,
						true
					)
				]).catch((error: Error) => {
					console.error(error);
					return undefined;
				});
			}
			const textTranslatedResults = langResults?.at(0);
			const htmlTranslatedResults = langResults?.at(1);
			if (
				textTranslatedResults == undefined ||
				textTranslatedResults.length !== textTranslateContents.length ||
				htmlTranslatedResults == undefined ||
				htmlTranslatedResults.length !== htmlTranslateContents.length
			) {
				throw new Error(
					`Translate results are empty. revisionId=${latestRevisionId}, source=${sourceLang}, target=${targetLang}`
				);
			}

			const beforeLangContent = beforeRevision?.contents.find(
				(content) => content.language_tag === targetLang
			);
			if (beforeLangContent) {
				const [
					translatedFreeAreaElements,
					translatedPaidAreaElements,
					translatedSalesAreaElements
				] = htmlTranslatedResults.map((html) => splitHtmlByTopLevelElements(html));

				const freeAreaRewoundElements = rewindHtmlContentAfterTranslate(
					translatedFreeAreaElements,
					splitHtmlByTopLevelElements(beforeLangContent.free_area_html),
					freeAreaExcludeIndex
				);
				const paidAreaRewoundElements = rewindHtmlContentAfterTranslate(
					translatedPaidAreaElements,
					splitHtmlByTopLevelElements(beforeLangContent.paid_area_html),
					paidAreaExcludeIndex
				);
				const salesAreaRewoundElements = rewindHtmlContentAfterTranslate(
					translatedSalesAreaElements,
					splitHtmlByTopLevelElements(beforeLangContent.sales_area_html),
					salesAreaExcludeIndex
				);

				results.set(targetLang, {
					title: textTranslatedResults[0],
					subtitle: textTranslatedResults[1],
					freeArea: freeAreaRewoundElements.map((elem) => elem.outerHTML).join(''),
					paidArea: paidAreaRewoundElements.map((elem) => elem.outerHTML).join(''),
					salesArea: salesAreaRewoundElements.map((elem) => elem.outerHTML).join('')
				});
			} else {
				results.set(targetLang, {
					title: textTranslatedResults[0],
					subtitle: textTranslatedResults[1],
					freeArea: htmlTranslatedResults[0],
					paidArea: htmlTranslatedResults[1],
					salesArea: htmlTranslatedResults[2]
				});
			}

			return true;
		})
	).catch((error: Error) => {
		console.error(error);
		return undefined;
	});

	const saveContents: DbBookContentCreateProp[] = [];
	for (const [targetLang, result] of results) {
		saveContents.push({
			...result,
			targetLanguage: targetLang as AvailableLanguageTags
		});
	}
	const { dbError: dbContentCreateError } = await dbBookContentCreate({
		revisionId: latestRevisionId,
		contents: saveContents
	});
	if (dbContentCreateError) {
		throw dbContentCreateError;
	}

	return results;
}

// target:
// 0. <p>Spring</p> ← exclude by compare[0]
// 1. <p>Summer</p>
// 2. <p>Fall</p> ← exclude by compare[1]
// compare:
// 0. <p>Spring</p>
// 1. <p>Fall</p>
//    ↓↓↓
// filteredElements = [<p>Summer</p>];
// excludedIndex = Map<[0, 0], [2, 1]>
function filteringHtmlContentShouldTranslate(
	targetElements: HTMLElement[],
	compareElements: HTMLElement[]
) {
	const compareHtmls = compareElements.map((elem) => elem.outerHTML);

	const filteredElements: HTMLElement[] = [];
	const excludedIndex = new Map<number, number>();
	targetElements.forEach((elem, elemIndex) => {
		const matchIndex = compareHtmls.findIndex((compareHtml) => compareHtml === elem.outerHTML);
		if (matchIndex === -1) {
			filteredElements.push(elem);
		} else {
			excludedIndex.set(elemIndex, matchIndex);
		}
	});

	return { filteredElements, excludedIndex };
}

// target:
// 0. <p>夏</p>
// compare:
// 0. <p>春</p>
// 1. <p>秋</p>
// rewindIndex:
// Map<[0, 0], [2, 1]>
//    ↓↓↓
// [<p>春</p>, <p>夏</p>, <p>秋</p>];
function rewindHtmlContentAfterTranslate(
	targetElements: HTMLElement[],
	compareElements: HTMLElement[],
	rewindIndex: Map<number, number>
) {
	const beforeContentRewinds = new Map<number, HTMLElement>();
	rewindIndex.forEach((compareIndex, insertIndex) => {
		beforeContentRewinds.set(insertIndex, compareElements[compareIndex]);
	});

	return rewindArray(targetElements, beforeContentRewinds);
}
