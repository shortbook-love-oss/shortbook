import { v3 as gcTranslate } from '@google-cloud/translate';
import { Translator as deeplTranslator } from 'deepl-node';
import { env } from '$env/dynamic/private';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import {
	deeplSourceLangKeys,
	deeplTargetLangKeys,
	googleSourceLangKeys,
	googleTargetLangKeys,
	translateContentByDeepl,
	translateContentByGoogle,
	type DeeplSourceLangKey,
	type DeeplTargetLangKey,
	type GoogleSourceLangKey,
	type GoogleTargetLangKey
} from '$lib-backend/functions/api/translate/translate';
import {
	dbBookContentCreate,
	type DbBookContentCreateProp
} from '$lib-backend/model/book/content/create';
import { dbBookContentGet } from '$lib-backend/model/book/content/get';

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
	revisionId: string,
	sourceLang: AvailableLanguageTags,
	targetLangs: AvailableLanguageTags[]
) {
	const { bookContent, dbError: dbBookGetError } = await dbBookContentGet({
		revisionId,
		targetLanguage: sourceLang,
		isIncludeDelete: true
	});
	if (dbBookGetError) {
		throw dbBookGetError;
	} else if (!bookContent) {
		throw new Error(`Can't find book content. revisionId=${revisionId}, sourceLang=${sourceLang}`);
	}

	const { dTranslator, gTranslator } = initTranslator();

	const results: Partial<Record<AvailableLanguageTags, TranslateContentResult>> = {};
	await Promise.all(
		targetLangs.map(async (targetLang) => {
			const textTranslateContents = [bookContent.title, bookContent.subtitle];
			const htmlTranslateContents = [
				bookContent.free_area_html,
				bookContent.paid_area_html,
				bookContent.sales_area_html
			];
			let langResults;
			// If translate into/from language that DeepL doesn't support, use Google Translate instead
			if (
				googleSourceLangKeys.includes(sourceLang as GoogleSourceLangKey) ||
				googleTargetLangKeys.includes(targetLang as GoogleTargetLangKey)
			) {
				langResults = await Promise.all([
					translateContentByGoogle(
						textTranslateContents,
						gTranslator,
						sourceLang,
						targetLang,
						false
					),
					translateContentByGoogle(htmlTranslateContents, gTranslator, sourceLang, targetLang, true)
				]).catch((e: Error) => {
					console.error(e);
					return undefined;
				});
			} else if (
				deeplSourceLangKeys.includes(sourceLang as DeeplSourceLangKey) &&
				deeplTargetLangKeys.includes(targetLang as DeeplTargetLangKey)
			) {
				langResults = await Promise.all([
					translateContentByDeepl(
						textTranslateContents,
						dTranslator,
						sourceLang,
						targetLang,
						false
					),
					translateContentByDeepl(htmlTranslateContents, dTranslator, sourceLang, targetLang, true)
				]).catch((e: Error) => {
					console.error(e);
					return undefined;
				});
			}
			if (
				langResults == undefined ||
				langResults[0].length !== textTranslateContents.length ||
				langResults[1].length !== htmlTranslateContents.length
			) {
				throw new Error(
					`Unsupportted language to translate. revisionId=${revisionId}, source=${sourceLang}, target=${targetLang}`
				);
			}

			results[targetLang] = {
				title: langResults[0][0],
				subtitle: langResults[0][1],
				freeArea: langResults[1][0],
				paidArea: langResults[1][1],
				salesArea: langResults[1][2]
			};
			return true;
		})
	).catch((e: Error) => {
		console.error(e);
		return undefined;
	});

	const saveContents: DbBookContentCreateProp[] = Object.entries(results).map(
		([targetLang, result]) => ({
			...result,
			targetLanguage: targetLang as AvailableLanguageTags
		})
	);
	const { dbError: dbContentCreateError } = await dbBookContentCreate({
		revisionId,
		contents: saveContents
	});
	if (dbContentCreateError) {
		throw dbContentCreateError;
	}

	return results;
}
