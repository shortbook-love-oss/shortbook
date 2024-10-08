import type { SelectItemSingle } from '$lib/utilities/select';

export const headingSelect = [
	{ value: 'h2', label: 'Heading 2', text: 'H2' },
	{ value: 'h3', label: 'Heading 3', text: 'H3' },
	{ value: 'h4', label: 'Heading 4', text: 'H4' },
	{ value: 'h5', label: 'Heading 5', text: 'H5' },
	{ value: 'h6', label: 'Heading 6', text: 'H6' }
] as const satisfies SelectItemSingle<string>[];
export const headingTypeValues = headingSelect.map((heading) => heading.value);
export type HeadingTypes = (typeof headingTypeValues)[number];

export const paragraphSelect = { value: 'p', label: 'Normal', text: 'Normal' } as const;

export function escapeHTML(original: string) {
	return original
		.replace(/&/g, '&amp;')
		.replace(/'/g, '&#x27;')
		.replace(/"/g, '&quot;')
		.replace(/>/g, '&gt;')
		.replace(/</g, '&lt;');
}
