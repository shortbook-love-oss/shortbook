import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
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

export interface MyBookItem extends BookCover {
	id: string;
	userId: string;
	status: number;
	publishedAt: Date;
	updatedAt: Date;
}

export interface BookItem extends MyBookItem {
	bookUrlSlug: string;
	userKeyHandle: string;
	penName: string;
	userImage: string;
}

export interface BookDetail extends BookItem {
	buyPoint: number;
	prologue: string;
	content: string;
	salesMessage: string;
	isBookDeleted: boolean;
}

// text-align: ***;
export const bookTextAlignSelect = [
	{ value: 'start', label: 'Left' },
	{ value: 'center', label: 'Center' },
	{ value: 'end', label: 'Right' }
] as const satisfies SelectItemSingle<string>[];

export type BookTextAlignSelectValues = (typeof bookTextAlignSelect)[number]['value'];

export const bookPointSelect: SelectItemSingle[] = [
	{ value: 200, label: '200' },
	{ value: 300, label: '300' },
	{ value: 500, label: '500' },
	{ value: 1000, label: '1000' },
	{ value: 2000, label: '2000' }
];

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
