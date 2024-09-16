import { z } from 'zod';
import { isAvailableLanguageTag } from '$lib/i18n/paraglide/runtime';
import { validateOnlyVisibleChar } from '$lib/utilities/validate';

export const schema = z.object({
	title: z.string().min(1).max(200).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	subtitle: z.string().max(200).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	nativeLanguage: z.string().max(5).refine(isAvailableLanguageTag, {
		message: 'Please select language'
	}),
	prologue: z.string().max(5e8).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	content: z.string().min(1).max(5e8).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	salesMessage: z.string().max(1000).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	keyName: z
		.string()
		.max(100)
		.regex(/[a-zA-Z0-9]/, {
			message: 'Please include at least one alphanumeric character'
		})
		.regex(/^[\w-.]*$/, {
			message: 'Use only alphanumeric, hyphens, underscore, and periods'
		}),
	buyPoint: z.coerce.number().min(70).max(1_000_000),
	// For book cover design
	baseColorStart: z.string().max(15),
	baseColorEnd: z.string().max(15),
	baseColorDirection: z.number().min(0).max(360),
	titleFontSize: z.number().min(10).max(256),
	titleAlign: z.number().min(0).max(2),
	titleColor: z.string().max(15),
	subtitleFontSize: z.number().min(10).max(128),
	subtitleAlign: z.number().min(0).max(2),
	subtitleColor: z.string().max(15),
	writerAlign: z.number().min(0).max(2),
	writerColor: z.string().max(15)
});
