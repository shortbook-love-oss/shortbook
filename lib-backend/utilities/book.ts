import { $generateHtmlFromNodes } from '@lexical/html';
import { JSDOM } from 'jsdom';
import { createEditor } from 'lexical';
import { initEditorConfig } from '$lib/components/modules/wysiwyg-editor/editor';

export async function fromEditorStateToHtml(stringifyState: string) {
	// To load Lexical editor server-side, replace window and document with jsdom
	const dom = new JSDOM();
	const _window = global.window;
	const _document = global.document;
	// @ts-expect-error
	global.window = dom.window;
	global.document = dom.window.document;

	const editor = createEditor(initEditorConfig);
	const html = await new Promise<string>(async (resolve, reject) => {
		try {
			const parsedEditorState = editor.parseEditorState(stringifyState);
			editor.setEditorState(parsedEditorState);
			editor.read(() => {
				resolve($generateHtmlFromNodes(editor));
			});
		} catch (e) {
			console.error(e);
			reject('');
		}
	});

	global.window = _window;
	global.document = _document;

	return html;
}
