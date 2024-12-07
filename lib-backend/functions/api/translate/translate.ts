import { v3 as gcTranslate } from '@google-cloud/translate';
import { Translator as DeeplTranslator, type SourceLanguageCode } from 'deepl-node';
import { env } from '$env/dynamic/private';
import { packArray, rewindArray } from '$lib/utilities/array';
import type { AvailableLanguageTags } from '$lib/utilities/language';

const deeplSourceLangIndex = {
	'en-US': 'en',
	ar: 'ar',
	nb: 'nb',
	sv: 'sv',
	fi: 'fi',
	et: 'et',
	es: 'es',
	fr: 'fr',
	it: 'it',
	nl: 'nl',
	de: 'de',
	da: 'da',
	cs: 'cs',
	hu: 'hu',
	uk: 'uk',
	ru: 'ru',
	'pt-BR': 'pt',
	ja: 'ja',
	ko: 'ko',
	id: 'id'
} as const satisfies Partial<Record<AvailableLanguageTags, SourceLanguageCode>>;
export type DeeplLangKey = keyof typeof deeplSourceLangIndex;
export const deeplLangKeys = Object.keys(deeplSourceLangIndex) as DeeplLangKey[];

const googleLangIndex = ['hi', 'zh-CN', 'zh-TW'] as const satisfies AvailableLanguageTags[];
export type GoogleLangKey = keyof typeof googleLangIndex;
export const googleLangKeys = Object.keys(googleLangIndex) as GoogleLangKey[];

// Main engine to translate
export async function translateContentByDeepl(
	contents: string[],
	translator: DeeplTranslator,
	sourceLang: DeeplLangKey,
	targetLang: DeeplLangKey,
	isHtml: boolean
) {
	const source = deeplSourceLangIndex[sourceLang as DeeplLangKey];
	const target = targetLang as DeeplLangKey;
	if (!source) {
		throw new Error(`Unsupported source language (${sourceLang})`);
	}

	const { filtered, excluded } = packArray(contents);
	const results = await translator
		.translateText(filtered, source, target, isHtml ? { tagHandling: 'html' } : {})
		.then((results) => results.map((result) => result.text))
		.catch((e: Error) => e);
	if (results instanceof Error) {
		console.error(results);
		throw new Error('Translation failed due to API error.');
	}

	return rewindArray(results, excluded);
}

// Fallback if specified source/target language isn't supported by main engine
export async function translateContentByGoogle(
	contents: string[],
	translator: gcTranslate.TranslationServiceClient,
	source: AvailableLanguageTags,
	target: AvailableLanguageTags,
	isHtml: boolean
) {
	const { filtered, excluded } = packArray(contents);
	const [response] = await translator.translateText({
		parent: `projects/${env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
		contents: filtered,
		mimeType: isHtml ? 'text/html' : 'text/plain',
		sourceLanguageCode: source,
		targetLanguageCode: target
	});
	if (response.translations == null) {
		throw new Error(`No response after translate (isHtml=${isHtml})`);
	}
	const results = response.translations?.map((result) => result.translatedText ?? '');

	return rewindArray(results, excluded);
}
