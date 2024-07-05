export interface MyBookItem {
	id: string;
	user_id: string;
	status: number;
	title: string;
	subtitle: string;
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
