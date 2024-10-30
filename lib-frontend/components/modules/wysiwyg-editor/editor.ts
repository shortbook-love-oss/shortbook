import type { SerializedCodeNode } from '@lexical/code';
import type { SerializedLinkNode } from '@lexical/link';
import type { SerializedListItemNode, SerializedListNode } from '@lexical/list';
import {
	$isHeadingNode,
	type SerializedHeadingNode,
	type SerializedQuoteNode
} from '@lexical/rich-text';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
	$createNodeSelection,
	$getRoot,
	$isNodeSelection,
	$isParagraphNode,
	$setSelection,
	type LexicalNode,
	type NodeKey,
	type RangeSelection,
	type SerializedEditorState,
	type SerializedElementNode,
	type SerializedParagraphNode,
	type SerializedTextNode
} from 'lexical';
import type { SerializedImageNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-editor/node';
import type { SerializedImageUploadingNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-uploading/node';
import type { SelectItemSingle } from '$lib/utilities/select';
import { allowedSize } from '$lib-backend/utilities/infrastructure/image';

type SerializedNodeChildren = { children: (SerializedTextNode | SerializedLinkNode)[] };

export type EditorState = SerializedEditorState<
	| SerializedElementNode<SerializedTextNode | SerializedLinkNode>
	| SerializedCodeNode
	| (SerializedHeadingNode & SerializedNodeChildren)
	| (SerializedListNode & {
			children: (SerializedListItemNode & { type: 'listitem' } & SerializedNodeChildren)[];
	  })
	| (SerializedParagraphNode & SerializedNodeChildren)
	| (SerializedQuoteNode & SerializedNodeChildren)
	| SerializedImageUploadingNode
	| SerializedImageNode
>;

export const editorImageMaxWidth: (typeof allowedSize)[number] = 768;

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

export const codeLanguageSelect = [
	{ value: 'plain', label: 'Select language' },
	{ value: 'c', label: 'C' },
	{ value: 'cpp', label: 'C++' },
	{ value: 'css', label: 'CSS' },
	{ value: 'd', label: 'D' },
	{ value: 'django', label: 'Django / Jinja2' },
	{ value: 'dart', label: 'Dart' },
	{ value: 'docker', label: 'Dockerfile' },
	{ value: 'go', label: 'Go' },
	{ value: 'graphql', label: 'GraphQL' },
	{ value: 'html', label: 'HTML' },
	{ value: 'ini', label: 'Ini' },
	{ value: 'java', label: 'Java' },
	{ value: 'js', label: 'JavaScript' },
	{ value: 'json', label: 'JSON' },
	{ value: 'markdown', label: 'Markdown' },
	{ value: 'objc', label: 'Objective-C' },
	{ value: 'powershell', label: 'PowerShell' },
	{ value: 'pug', label: 'Pug' },
	{ value: 'py', label: 'Python' },
	{ value: 'r', label: 'R' },
	{ value: 'jsx', label: 'React JSX' },
	{ value: 'tsx', label: 'React TSX' },
	{ value: 'regex', label: 'Regex' },
	{ value: 'ruby', label: 'Ruby' },
	{ value: 'rust', label: 'Rust' },
	{ value: 'scss', label: 'Sass (SCSS)' },
	{ value: 'sql', label: 'SQL' },
	{ value: 'swift', label: 'Swift' },
	{ value: 'toml', label: 'TOML' },
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'yaml', label: 'YAML' }
] as const satisfies SelectItemSingle<string>[];
export type CodeLanguageItem = (typeof codeLanguageSelect)[number];

// Find block node of lexical editor state, not text node in the block node
export function findSelectedStartBlock(selection: RangeSelection) {
	return selection.anchor.getNode().getTopLevelElement();
}

// If only exist an empty paragraph / heading node, the editor consider to be empty
export function isEditorEmpty() {
	const rootNode = $getRoot();
	if (rootNode.getTextContentSize() === 0 && rootNode.getChildrenSize() === 1) {
		const firstBlockNode = rootNode.getFirstChild();
		return $isParagraphNode(firstBlockNode) || $isHeadingNode(firstBlockNode);
	} else {
		return false;
	}
}

export function selectBlockEnd(selection: RangeSelection) {
	if (selection.anchor.isBefore(selection.focus)) {
		selection.focus.getNode().getTopLevelElement()?.selectEnd();
	} else {
		selection.anchor.getNode().getTopLevelElement()?.selectEnd();
	}
	// Now selection.isCollapsed() is always true
}

export function insertBlockNodeToNext<T extends LexicalNode>(
	selection: RangeSelection,
	insertNode: T
) {
	const firstBlockNode = $getRoot().getFirstChild();
	const blockNode = selection.focus.getNode().getTopLevelElement();
	// "insertNodeToNearestRoot" inserts the specify block and the empty paragraph block
	const insertedNode = $insertNodeToNearestRoot(insertNode);
	insertedNode.getNextSibling()?.selectStart();
	if (
		blockNode &&
		blockNode.getTextContentSize() === 0 &&
		firstBlockNode?.getKey() !== blockNode.getKey()
	) {
		blockNode.remove();
	}

	return insertNode;
}

export function getImageSizeForSrc(width: number, maxWidth: number) {
	if (width <= maxWidth) {
		// width=150 ... w="" (keep original size)
		return '';
	} else {
		// width=2048 ... w="1280" (full-width and same aspect)
		return `w=${maxWidth}&`;
	}
}

export function selectSingleNode(nodeKey: NodeKey) {
	const selection = $createNodeSelection();
	$setSelection(selection);
	if ($isNodeSelection(selection)) {
		selection.add(nodeKey);
	}
}
