import { z } from 'zod';
import { availableLanguageTags } from '$i18n/output/runtime';
import { validateOnlyVisibleChar } from '$lib/validation/rules/string';

export const schema = z.object({
	keyHandle: z
		.string()
		.max(30)
		.regex(/[a-zA-Z0-9]/, {
			message: 'Please include at least one alphanumeric character'
		})
		.regex(/^[\w-.]*$/, {
			message: 'Use only alphanumeric, hyphens, underscore, and periods'
		}),
	nativeLanguage: z.enum(availableLanguageTags, { message: 'Please select language' }),
	penName: z.string().min(1).max(50).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	headline: z.string().max(50).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	selfIntroduction: z.string().max(4e6).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}) // less than 16,777,216 / 4 - 1
});
