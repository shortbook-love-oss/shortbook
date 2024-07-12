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
	prologues: ContentParagraph[];
	contents: ContentParagraph[];
	sales_message: string;
}

export interface ContentParagraph {
	tagName: string;
	content: string;
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

export function contentsToMarkdown(contents: string) {
	return contents.split('\n').map((content) => {
		const paragraph: ContentParagraph = {
			tagName: 'p',
			content
		};
		// Support markdown feature (only heading level 2-6)
		if (content[0] === '#') {
			const parsed = content.match(/^(#{2,6})?\s?(.*)/);
			const maybeSharp = parsed?.[1];
			const formattedContent = parsed?.[2];
			if (maybeSharp && formattedContent) {
				// ## FooBarBaz → <h2>FooBarBaz</h2>
				// ######FooBarBaz → <h6>FooBarBaz</h6>
				// # FooBarBaz → <p># FooBarBaz</p>
				paragraph.tagName = 'h' + maybeSharp.length;
				paragraph.content = formattedContent;
			}
		}
		return paragraph;
	});
}
