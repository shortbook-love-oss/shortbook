import { z } from 'zod';
import { isAvailableLanguageTag } from '$i18n/output/runtime';
import { validateBookTextAlign } from '$lib/validation/rules/book';
import { validateColor, validateOnlyVisibleChar } from '$lib/validation/rules/string';

export const schemaPartUrlSlug = z.object({
	urlSlug: z
		.string()
		.max(100)
		.regex(/[a-zA-Z0-9]/, {
			message: 'Please include at least one alphanumeric character'
		})
		.regex(/^[\w-.]*$/, {
			message: 'Use only alphanumeric, hyphens, underscore, and periods'
		})
});

export const schema = z
	.object({
		targetLanguage: z.string().max(5).refine(isAvailableLanguageTag, {
			message: 'Please select language'
		}),
		buyPoint: z.number().min(70).max(1_000_000),
		// For book cover design
		baseColorStart: z.string().max(15).refine(validateColor, {
			message: 'Please specify valid color (e.g. #01FC78)'
		}),
		baseColorEnd: z.string().max(15).refine(validateColor, {
			message: 'Please specify valid color (e.g. #01FC78)'
		}),
		baseColorDirection: z.number().min(0).max(360).step(3),
		titleFontSize: z.number().min(10).max(256).step(1),
		titleAlign: z.string().min(1).max(7).refine(validateBookTextAlign, {
			message: 'Please select text position'
		}),
		titleColor: z.string().max(15).refine(validateColor, {
			message: 'Please specify valid color (e.g. #01FC78)'
		}),
		subtitleFontSize: z.number().min(10).max(128).step(1),
		subtitleAlign: z.string().min(1).max(7).refine(validateBookTextAlign, {
			message: 'Please select text position'
		}),
		subtitleColor: z.string().max(15).refine(validateColor, {
			message: 'Please specify valid color (e.g. #01FC78)'
		}),
		writerAlign: z.string().min(1).max(7).refine(validateBookTextAlign, {
			message: 'Please select text position'
		}),
		writerColor: z.string().max(15).refine(validateColor, {
			message: 'Please specify valid color (e.g. #01FC78)'
		})
	})
	.merge(schemaPartUrlSlug);
