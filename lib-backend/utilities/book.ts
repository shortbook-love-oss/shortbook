import { $generateHtmlFromNodes } from '@lexical/html';
import DOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import { createEditor, type SerializedEditorState } from 'lexical';
import { initEditorConfig, isEditorEmpty } from '$lib/components/modules/wysiwyg-editor/editor';

export async function fromEditorStateToHtml(serializedState: SerializedEditorState) {
	// To load Lexical editor server-side, replace window and document with jsdom
	const dom = new JSDOM();
	const _window = global.window;
	const _document = global.document;
	const _DOMParser = global.DOMParser;
	const _HTMLElement = global.HTMLElement;
	const _HTMLAnchorElement = global.HTMLAnchorElement;
	// @ts-expect-error "Lexical editor requires JSDOM to run on the server side"
	global.window = dom.window;
	global.document = dom.window.document;
	global.DOMParser = dom.window.DOMParser;
	global.HTMLElement = dom.window.HTMLElement;
	global.HTMLAnchorElement = dom.window.HTMLAnchorElement;

	const editor = createEditor(initEditorConfig);
	const { html, hasContent } = await new Promise<{ html: string; hasContent: boolean }>(
		(resolve, reject) => {
			try {
				editor.setEditorState(editor.parseEditorState(serializedState));
				editor.read(() => {
					const hasContent = !isEditorEmpty(editor);
					if (hasContent) {
						const contentDom = new DOMParser().parseFromString(
							DOMPurify.sanitize($generateHtmlFromNodes(editor)),
							'text/html'
						);
						normalizeBookContentDom(contentDom.body);
						resolve({
							html: contentDom.body.innerHTML,
							hasContent
						});
					} else {
						resolve({ html: '', hasContent });
					}
				});
			} catch (e) {
				console.error(e);
				reject({ html: '', hasContent: false });
			}
		}
	);

	global.window = _window;
	global.document = _document;
	global.DOMParser = _DOMParser;
	global.HTMLElement = _HTMLElement;
	global.HTMLAnchorElement = _HTMLAnchorElement;

	return { html, hasContent };
}

function normalizeBookContentDom(rootElem: HTMLElement) {
	// <p><span style="white-space: pre-wrap">FooBar</span></p> → <p>FooBar</p>
	const unnecessaryTextWrappers = rootElem.querySelectorAll(
		':not(pre[data-highlight-language])>span[style="white-space: pre-wrap;"]'
	);
	unnecessaryTextWrappers.forEach((elem) => {
		elem.outerHTML = elem.innerHTML;
	});

	// <pre><span style="white-space: pre-wrap">CodeAlice</span></pre>
	// → <pre translate="no" style="white-space: pre-wrap"><span>CodeAlice</span></pre>
	const unnecessaryStyles = rootElem.querySelectorAll(
		':where(pre[data-highlight-language]>span, code, strong, b, em, i)[style="white-space: pre-wrap;"]'
	);
	unnecessaryStyles.forEach((elem) => {
		if (elem instanceof HTMLElement) {
			elem.style.whiteSpace = '';
			if (elem.getAttribute('style') === '') {
				elem.removeAttribute('style');
			}
		}
	});
	const codeBlocks = rootElem.querySelectorAll('pre[data-highlight-language]');
	codeBlocks.forEach((elem) => {
		if (elem instanceof HTMLElement) {
			elem.translate = false;
			elem.style.whiteSpace = 'pre-wrap';
		}
	});

	// <code>FooBar</code> → <code translate="no">FooBar</code>
	const inlineCodes = rootElem.querySelectorAll('code');
	inlineCodes.forEach((elem) => {
		if (elem instanceof HTMLElement) {
			elem.translate = false;
		}
	});

	// Need to show pseudo elements for line number
	// <pre><span>Line 1</span><br><br><span>Line 3</span></pre>
	// → <pre><span>Line 1</span><br><span></span><br><span>Line 3</span></pre>
	const codeLineBreaks = rootElem.querySelectorAll('pre[data-highlight-language]>br');
	codeLineBreaks.forEach((elem) => {
		if (
			elem.parentElement instanceof HTMLElement &&
			elem.previousElementSibling?.localName === 'br'
		) {
			const emptyLineElem = document.createElement('span');
			elem.parentElement.insertBefore(emptyLineElem, elem);
		}
	});

	// <p dir="ltr">FooBar</p> → <p>FooBar</p>
	const unnecessaryDirections = rootElem.querySelectorAll(':not(bdo,bdi)[dir]');
	unnecessaryDirections.forEach((elem) => {
		if (elem instanceof HTMLElement) {
			elem.removeAttribute('dir');
		}
	});

	// Lexical maybe can't add the "target" attribute on SSR
	const extraLinks = rootElem.querySelectorAll('a[rel="noreferrer ugc"]');
	extraLinks.forEach((elem) => {
		if (elem instanceof HTMLAnchorElement) {
			elem.target = '_blank';
		}
	});
}
