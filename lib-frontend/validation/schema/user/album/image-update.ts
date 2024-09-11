import { z } from 'zod';
import { validateOnlyVisibleChar } from '$lib/utilities/validate';

export const schema = z.object({
	name: z.string().min(1).max(50).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	alt: z.string().max(100).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	place: z.string().max(40).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	licenseUrl: z.union([
		z.string().url().max(255),
		z.string().max(0)
	]),
	creditNotice: z.string().max(50).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	isSensitive: z.number().min(0).max(1),
	isAi: z.number().min(0).max(2)
});
