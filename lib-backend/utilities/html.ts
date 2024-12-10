import { JSDOM } from 'jsdom';

export function splitHtmlByTopLevelElements(html: string) {
	const dom = new JSDOM(html);
	const children: HTMLElement[] = [];
	for (const element of dom.window.document.body.children) {
		if (element instanceof dom.window.HTMLElement) {
			children.push(element);
		}
	}
	return children;
}
