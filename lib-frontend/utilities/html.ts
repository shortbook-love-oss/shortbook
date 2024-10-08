import type { SelectItemSingle } from '$lib/utilities/select';

export const paragraphSelect = { value: 'p', label: 'Paragraph' } as const;

export const headingSelect = [
	{ value: 'h2', label: 'Heading 2' },
	{ value: 'h3', label: 'Heading 3' },
	{ value: 'h4', label: 'Heading 4' },
	{ value: 'h5', label: 'Heading 5' },
	{ value: 'h6', label: 'Heading 6' }
] as const satisfies SelectItemSingle<string>[];
export const headingTypeValues = headingSelect.map((heading) => heading.value);
export type HeadingTypes = (typeof headingTypeValues)[number];

export const unorderedListSelect = { value: 'ul', label: 'Unordered List' } as const;
export const orderedListSelect = { value: 'ol', label: 'Numbered List' } as const;

export const blockquoteSelect = { value: 'blockquote', label: 'Quote' } as const;

export const codeBlockSelect = { value: 'codeblock', label: 'Code Block' } as const;

export function escapeHTML(original: string) {
	return original
		.replace(/&/g, '&amp;')
		.replace(/'/g, '&#x27;')
		.replace(/"/g, '&quot;')
		.replace(/>/g, '&gt;')
		.replace(/</g, '&lt;');
}
