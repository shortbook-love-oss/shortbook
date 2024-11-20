import { $generateHtmlFromNodes } from '@lexical/html';
import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';
import { createEditor, type SerializedEditorState } from 'lexical';
import { initEditorConfig, isEditorEmpty } from '$lib/components/modules/wysiwyg-editor/editor';

export async function fromEditorStateToHtml(serializedState: SerializedEditorState) {
	// To load Lexical editor server-side, replace window and document with jsdom
	const dom = new JSDOM();
	const _window = global.window;
	const _document = global.document;
	// @ts-expect-error "Lexical editor requires JSDOM to run on the server side"
	global.window = dom.window;
	global.document = dom.window.document;

	const editor = createEditor(initEditorConfig);
	const { html, hasContent } = await new Promise<{ html: string; hasContent: boolean }>(
		(resolve, reject) => {
			try {
				editor.setEditorState(editor.parseEditorState(serializedState));
				editor.read(() => {
					const hasContent = !isEditorEmpty(editor);
					if (hasContent) {
						resolve({
							html: DOMPurify.sanitize(
								$generateHtmlFromNodes(editor).replace(/\sstyle="white-space:\s?pre-wrap;"/g, '')
							),
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

	return { html, hasContent };
}
