import { z } from 'zod';
import { isLanguageTag } from '$lib/utilities/language';
import { validateOnlyVisibleChar } from '$lib/utilities/validate';

export const schema = z.object({
	slug: z
		.string()
		.max(30)
		.regex(/[a-zA-Z0-9]/, {
			message: 'Please include at least one alphanumeric character'
		})
		.regex(/^[\w-.]*$/, {
			message: 'Use only alphanumeric, hyphens, underscore, and periods'
		}),
	nativeLang: z.string().max(5).refine(isLanguageTag, {
		message: 'Please select language'
	}),
	penName: z.string().min(1).max(50).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	headline: z.string().max(50).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	selfIntro: z.string().max(4e6).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}) // less than 16,777,216 / 4 - 1
});
