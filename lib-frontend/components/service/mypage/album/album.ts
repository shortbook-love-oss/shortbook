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
	{ value: 1, label: 'Yes — Erotica as art' },
	{ value: 2, label: 'Yes — Medical operation, Vivisection' },
	{ value: 3, label: 'Yes — Natural disaster' },
	{ value: 4, label: 'Yes — Slaughter of animals' },
	{ value: 5, label: 'Yes — Graphic violence, Battle, Profanity, Bleeding' },
	{ value: 6, label: 'Yes — Accident, Incident, or few seconds before these' },
	{ value: 7, label: 'Yes — Adult Nudity, Pornography' },
	{ value: 8, label: 'Yes — Other sensitive (R18+)' }
];

export const albumImageAiSelect: Select[] = [
	{ value: 0, label: 'No' },
	{ value: 1, label: 'Yes — Use AI for correction / super scale / object remove / etc.' },
	{ value: 2, label: 'Yes — Use generative AI' }
];
