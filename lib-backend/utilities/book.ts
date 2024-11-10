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
	// @ts-expect-error
	global.window = dom.window;
	global.document = dom.window.document;

	const editor = createEditor(initEditorConfig);
	const { html, hasContent } = await new Promise<{ html: string; hasContent: boolean }>(
		async (resolve, reject) => {
			try {
				const parsedEditorState = editor.parseEditorState(serializedState);
				editor.setEditorState(parsedEditorState);
				editor.read(() => {
					const hasContent = !isEditorEmpty(editor);
					if (hasContent) {
						resolve({
							html: DOMPurify.sanitize($generateHtmlFromNodes(editor)),
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
