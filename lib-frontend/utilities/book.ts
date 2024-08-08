import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import type { SelectItem } from './select';

export interface BookCover {
	title: string;
	subtitle: string;

	baseColorStart: string;
	baseColorEnd: string;
	baseColorDirection: number;
	titleFontSize: number;
	titleAlign: number;
	titleColor: string;
	subtitleFontSize: number;
	subtitleAlign: number;
	subtitleColor: string;
	writerAlign: number;
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
	keyName: string;
	penName: string;
	image: string;
}

export interface BookDetail extends BookItem {
	prologue: string;
	content: string;
	salesMessage: string;
	isBookDeleted: boolean;
}

// font-size: ***;
export const bookFontSizeSelect: SelectItem[] = [
	{ value: 32, label: 'Tiny' },
	{ value: 48, label: 'Smaller' },
	{ value: 64, label: 'Small' },
	{ value: 96, label: 'Medium' },
	{ value: 128, label: 'Big' },
	{ value: 160, label: 'Impact' }
];

// text-align: ***;
export const bookTextAlignSelect: SelectItem[] = [
	{ value: 0, text: 'start', label: 'Left' },
	{ value: 1, text: 'center', label: 'Center' },
	{ value: 2, text: 'end', label: 'Right' }
];

export function getBookCover(editCover: Partial<BookCover>): BookCover {
	const defaultCover: BookCover = {
		title: '',
		subtitle: '',
		baseColorStart: '#671b19',
		baseColorEnd: '#c7706e',
		baseColorDirection: 135,
		titleFontSize: 96,
		titleAlign: 0,
		titleColor: '#ffffff',
		subtitleFontSize: 64,
		subtitleAlign: 0,
		subtitleColor: '#ffffff',
		writerAlign: 0,
		writerColor: '#ffffff'
	};
	return { ...defaultCover, ...editCover };
}

export async function contentsToMarkdown(content: string) {
	return DOMPurify.sanitize(await marked.parse(content));
}
