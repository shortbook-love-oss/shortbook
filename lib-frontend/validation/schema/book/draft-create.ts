import { z } from 'zod';
import { availableLanguageTags } from '$i18n/output/runtime';
import { validateEditorContent } from '$lib/validation/rules/book';

export const schema = z.object({
	nativeLanguage: z.enum(availableLanguageTags, { message: 'Please select language' }),
	title: z.string().max(200),
	subtitle: z.string().max(200),
	freeArea: z.record(z.record(z.unknown())).refine(validateEditorContent, {
		message: 'Invalid serialized book content'
	}),
	paidArea: z.record(z.record(z.unknown())).refine(validateEditorContent, {
		message: 'Invalid serialized book content'
	}),
	salesArea: z.record(z.record(z.unknown())).refine(validateEditorContent, {
		message: 'Invalid serialized book content'
	})
});
