import type { SuperValidated } from 'sveltekit-superforms';
import type { AvailableLanguageTags } from '$lib/utilities/language';

export interface AlbumImageItem {
	editForm: SuperValidated<Record<string, unknown>>;
	id: string;
	name: string;
	alt: string;
	languageInImage: AvailableLanguageTags | '';
	filePath: string;
	byteLength: number;
	width: number;
	height: number;
	toExtension: string;
}

interface Select {
	value: number;
	label: string;
}

export const albumImageSensitiveSelect: Select[] = [
	{ value: 0, label: 'No — Content for all' },
	{ value: 1, label: 'Sensitive — R18+' }
];

export const albumImageAiSelect: Select[] = [
	{ value: 0, label: 'No' },
	{ value: 1, label: 'Yes — Use AI for correction / super scale / object remove / etc.' },
	{ value: 2, label: 'Yes — Use generative AI' }
];
