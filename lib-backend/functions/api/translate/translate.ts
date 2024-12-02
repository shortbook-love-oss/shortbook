import { v3 as gcTranslate } from '@google-cloud/translate';
import {
	Translator as DeeplTranslator,
	type SourceLanguageCode,
	type TargetLanguageCode
} from 'deepl-node';
import { env } from '$env/dynamic/private';
import { packArray, rewindArray } from '$lib/utilities/array';
import type { AvailableLanguageTags } from '$lib/utilities/language';

const deeplSourceLangIndex = {
	en: 'en',
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
	'pt-br': 'pt',
	ja: 'ja',
	ko: 'ko',
	id: 'id'
} as const satisfies Partial<Record<AvailableLanguageTags, SourceLanguageCode>>;
export type DeeplSourceLangKey = keyof typeof deeplSourceLangIndex;
export const deeplSourceLangKeys = Object.keys(deeplSourceLangIndex) as DeeplSourceLangKey[];
const deeplTargetLangIndex = {
	en: 'en-US',
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
	'pt-br': 'pt-BR',
	ja: 'ja',
	ko: 'ko',
	id: 'id'
} as const satisfies Partial<Record<AvailableLanguageTags, TargetLanguageCode>>;
export type DeeplTargetLangKey = keyof typeof deeplTargetLangIndex;
export const deeplTargetLangKeys = Object.keys(deeplTargetLangIndex) as DeeplTargetLangKey[];

const googleSourceLangIndex = {
	hi: 'hi',
	'zh-cn': 'zh-CN',
	'zh-tw': 'zh-TW'
} as const satisfies Partial<Record<AvailableLanguageTags, string>>;
export type GoogleSourceLangKey = keyof typeof googleSourceLangIndex;
export const googleSourceLangKeys = Object.keys(googleSourceLangIndex) as GoogleSourceLangKey[];
const googleTargetLangIndex = googleSourceLangIndex;
export type GoogleTargetLangKey = GoogleSourceLangKey;
export const googleTargetLangKeys = googleSourceLangKeys;

// Main engine to translate
export async function translateContentByDeepl(
	contents: string[],
	translator: DeeplTranslator,
	sourceLang: AvailableLanguageTags,
	targetLang: AvailableLanguageTags,
	isHtml: boolean
) {
	const source = deeplSourceLangIndex[sourceLang as DeeplSourceLangKey];
	const target = deeplTargetLangIndex[targetLang as DeeplTargetLangKey];
	if (!source || !target) {
		return contents.map(() => '');
	}

	const { filtered, excluded } = packArray(contents);
	const results = await translator
		.translateText(filtered, source, target, isHtml ? { tagHandling: 'html' } : {})
		.then((results) => results.map((result) => result.text));

	return rewindArray(results, excluded);
}

// Fallback if specified source/target language isn't supported by main engine
export async function translateContentByGoogle(
	contents: string[],
	translator: gcTranslate.TranslationServiceClient,
	sourceLang: AvailableLanguageTags,
	targetLang: AvailableLanguageTags,
	isHtml: boolean
) {
	const source =
		googleSourceLangIndex[sourceLang as GoogleSourceLangKey] ??
		deeplSourceLangIndex[sourceLang as DeeplSourceLangKey];
	const target =
		googleTargetLangIndex[targetLang as GoogleTargetLangKey] ??
		deeplTargetLangIndex[targetLang as DeeplTargetLangKey];
	if (!source || !target) {
		return contents.map(() => '');
	}

	const { filtered, excluded } = packArray(contents);
	const [response] = await translator.translateText({
		parent: `projects/${env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
		contents: filtered,
		mimeType: isHtml ? 'text/html' : 'text/plain',
		sourceLanguageCode: source,
		targetLanguageCode: target
	});
	if (response.translations == null) {
		return contents.map(() => '');
	}
	const results = response.translations?.map((result) => result.translatedText ?? '');

	return rewindArray(results, excluded);
}
