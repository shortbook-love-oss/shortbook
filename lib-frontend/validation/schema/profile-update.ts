import { z } from 'zod';
import { isLanguageTag } from '$lib/utilities/language';

export const schema = z.object({
	slug: z
		.string()
		.min(1)
		.max(30)
		.regex(/^[\w-.]+$/),
	nativeLang: z.string().min(1).max(5).refine(isLanguageTag),
	penName: z.string().min(1).max(50),
	headline: z.string().max(50),
	selfIntro: z.string().max(4e6) // less than 16,777,216 / 4 - 1
});
