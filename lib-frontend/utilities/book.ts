import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import type { SelectItemSingle } from '$lib/utilities/select';

export interface BookCover {
	title: string;
	subtitle: string;

	baseColorStart: string;
	baseColorEnd: string;
	baseColorDirection: number;
	titleFontSize: number;
	titleAlign: string;
	titleColor: string;
	subtitleFontSize: number;
	subtitleAlign: string;
	subtitleColor: string;
	writerAlign: string;
	writerColor: string;
}

interface BookItemBase extends BookCover {
	id: string;
	userId: string;
	status: number;
	updatedAt: Date;
}

export interface BookItem extends BookItemBase {
	bookUrlSlug: string;
	userKeyHandle: string;
	penName: string;
	userImage: string;
}

export interface MyBookItem extends BookItemBase {
	hasPublishedRevision: boolean;
	translateLanguages: AvailableLanguageTags[];
	isAdminBook: boolean;
}

export interface BookDetail extends BookItem {
	buyPoint: number;
	freeArea: string;
	paidArea: string;
	salesArea: string;
	isAdminBook: boolean;
	isBookDeleted: boolean;
}

export interface BookDraftUpdateResult {
	bookId: string;
}

// text-align: ***;
export const bookTextAlignSelect = [
	{ value: 'start', label: 'Left' },
	{ value: 'center', label: 'Center' },
	{ value: 'end', label: 'Right' }
] as const satisfies SelectItemSingle<string>[];

export type BookTextAlignSelectValues = (typeof bookTextAlignSelect)[number]['value'];

export const bookPointSelect: SelectItemSingle[] = [
	{ value: 100, label: '100' },
	{ value: 200, label: '200' },
	{ value: 300, label: '300' },
	{ value: 500, label: '500' },
	{ value: 1000, label: '1000' }
];

export const bookCreateUrlParam = 'new';

export function getBookCover(editCover: Partial<BookCover>): BookCover {
	const defaultCover: BookCover = {
		title: '',
		subtitle: '',
		baseColorStart: '#671b19',
		baseColorEnd: '#c7706e',
		baseColorDirection: 135,
		titleFontSize: 96,
		titleAlign: bookTextAlignSelect[0].value,
		titleColor: '#ffffff',
		subtitleFontSize: 64,
		subtitleAlign: bookTextAlignSelect[0].value,
		subtitleColor: '#ffffff',
		writerAlign: bookTextAlignSelect[0].value,
		writerColor: '#ffffff'
	};
	return { ...defaultCover, ...editCover };
}

export async function contentsToMarkdown(content: string) {
	return DOMPurify.sanitize(await marked.parse(content));
}
