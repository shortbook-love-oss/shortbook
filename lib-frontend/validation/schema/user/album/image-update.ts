import { z } from 'zod';
import {
	validateOnlyVisibleChar,
	validateOptionalLanguageTag,
	validateOptionalUrl
} from '$lib/utilities/validate';

export const schema = z.object({
	name: z.string().min(1).max(50).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	alt: z.string().max(100).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	languageInImage: z.string().max(5).refine(validateOptionalLanguageTag, {
		message: 'Please select language'
	}),
	place: z.string().max(40).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	licenseUrl: z.string().max(255).refine(validateOptionalUrl, {
		message: 'Invalid URL'
	}),
	creditNotice: z.string().max(50).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	isSensitive: z.number().min(0).max(1),
	isAi: z.number().min(0).max(2)
});
