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
	})
});
