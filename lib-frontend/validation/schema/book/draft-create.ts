import { z } from 'zod';
import { validateEditorContent } from '$lib/validation/rules/book';

export const schema = z.object({
	title: z.string().max(200),
	subtitle: z.string().max(200),
	freeArea: z.record(z.record(z.unknown())).refine(validateEditorContent, {
		message: 'Invalid serialized book content'
	}),
	paidArea: z.record(z.record(z.unknown())).refine(validateEditorContent, {
		message: 'Invalid serialized book content'
	})
});
