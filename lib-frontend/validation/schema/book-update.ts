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
	buyPoint: z.coerce.number().min(70).max(1_000_000),
	// For book cover design
	baseColorStart: z.string().max(15),
	baseColorEnd: z.string().max(15),
	baseColorDirection: z.number().min(0).max(360),
	titleFontSize: z.number().min(10).max(160),
	titleAlign: z.number().min(0).max(2),
	titleColor: z.string().max(15),
	subtitleFontSize: z.number().min(10).max(160),
	subtitleAlign: z.number().min(0).max(2),
	subtitleColor: z.string().max(15),
	writerAlign: z.number().min(0).max(2),
	writerColor: z.string().max(15)
});
