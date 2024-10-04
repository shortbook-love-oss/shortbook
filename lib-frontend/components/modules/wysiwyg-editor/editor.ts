import type { SerializedCodeNode } from '@lexical/code';
import type { SerializedLinkNode } from '@lexical/link';
import type { SerializedListNode } from '@lexical/list';
import type { SerializedHeadingNode, SerializedQuoteNode } from '@lexical/rich-text';
import type {
	SerializedEditorState,
	SerializedElementNode,
	SerializedParagraphNode,
	SerializedTextNode
} from 'lexical';

export type EditorState = SerializedEditorState<
	| SerializedElementNode<SerializedTextNode | SerializedLinkNode>
	| SerializedCodeNode
	| (SerializedHeadingNode & { children: (SerializedTextNode | SerializedLinkNode)[] })
	| (SerializedListNode & {
			children: (SerializedElementNode & {
				type: 'listitem';
				children: (SerializedTextNode | SerializedLinkNode)[];
			})[];
	  })
	| (SerializedParagraphNode & { children: (SerializedTextNode | SerializedLinkNode)[] })
	| (SerializedQuoteNode & { children: (SerializedTextNode | SerializedLinkNode)[] })
>;

export const initEditorState: EditorState = {
	root: {
		children: [
			{
				children: [],
				direction: null,
				format: '',
				indent: 0,
				type: 'paragraph',
				version: 1,
				textFormat: 0,
				textStyle: ''
			}
		],
		direction: null,
		format: '',
		indent: 0,
		type: 'root',
		version: 1
	}
};
