import {
	CodeHighlightNode,
	CodeNode,
	registerCodeHighlighting,
	type SerializedCodeNode
} from '@lexical/code';
import { registerDragonSupport } from '@lexical/dragon';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { AutoLinkNode, LinkNode, type SerializedLinkNode } from '@lexical/link';
import {
	ListItemNode,
	ListNode,
	type SerializedListItemNode,
	type SerializedListNode
} from '@lexical/list';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import {
	$isHeadingNode,
	type SerializedHeadingNode,
	type SerializedQuoteNode
} from '@lexical/rich-text';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
	$createNodeSelection,
	$getRoot,
	$getSelection,
	$isDecoratorNode,
	$isNodeSelection,
	$isParagraphNode,
	$isRangeSelection,
	$setSelection,
	DecoratorNode,
	ElementNode,
	ParagraphNode,
	type CreateEditorArgs,
	type LexicalEditor,
	type LexicalNode,
	type NodeKey,
	type RangeSelection,
	type SerializedEditorState,
	type SerializedElementNode,
	type SerializedParagraphNode,
	type SerializedTextNode
} from 'lexical';
import { writable } from 'svelte/store';
import {
	ImageNode,
	type SerializedImageNode
} from '$lib/components/modules/wysiwyg-editor/blocks/album-image-editor/node';
import { registerImagePlugin } from '$lib/components/modules/wysiwyg-editor/blocks/album-image-editor/plugin';
import {
	ImageUploadingNode,
	type SerializedImageUploadingNode
} from '$lib/components/modules/wysiwyg-editor/blocks/album-image-uploading/node';
import { registerImageUploaderPlugin } from '$lib/components/modules/wysiwyg-editor/blocks/album-image-uploading/plugin';
import {
	DividerNode,
	type SerializedDividerNode
} from '$lib/components/modules/wysiwyg-editor/blocks/divider/node';
import { registerDividerBlock } from '$lib/components/modules/wysiwyg-editor/blocks/divider/plugin';
import { registerDecoratorNodeBase } from '$lib/components/modules/wysiwyg-editor/blocks/decorator-node-base';
import { registerListItemEscape } from '$lib/components/modules/wysiwyg-editor/plugins/list-item-escape';
import { registerPluginPasteLinkReplacer } from '$lib/components/modules/wysiwyg-editor/plugins/paste-link-replacer';
import { theme } from '$lib/components/modules/wysiwyg-editor/themes/default';
import type { SelectItemSingle } from '$lib/utilities/select';
import { allowedSize } from '$lib-backend/utilities/infrastructure/image';

export type BlockNode = ElementNode | DecoratorNode<HTMLElement>;

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
	| SerializedDividerNode
>;

export const editorImageMaxWidth: (typeof allowedSize)[number] = 768;

export const lastActiveEditor = writable('');

export const initEditorConfig: CreateEditorArgs = {
	nodes: [
		CodeHighlightNode,
		CodeNode,
		HeadingNode,
		LinkNode,
		AutoLinkNode,
		ListNode,
		ListItemNode,
		QuoteNode,
		ImageNode,
		ImageUploadingNode,
		DividerNode
	],
	onError: (error: Error) => {
		throw error;
	},
	theme
};

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
	{ value: 'csharp', label: 'C#' },
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
	{ value: 'makefile', label: 'Makefile' },
	{ value: 'markdown', label: 'Markdown' },
	{ value: 'mathml', label: 'MathML' },
	{ value: 'objc', label: 'Objective-C' },
	{ value: 'php', label: 'PHP' },
	{ value: 'powershell', label: 'PowerShell' },
	{ value: 'pug', label: 'Pug' },
	{ value: 'py', label: 'Python' },
	{ value: 'r', label: 'R' },
	{ value: 'jsx', label: 'React JSX' },
	{ value: 'tsx', label: 'React TSX' },
	{ value: 'regex', label: 'Regex' },
	{ value: 'ruby', label: 'Ruby' },
	{ value: 'rust', label: 'Rust' },
	{ value: 'scala', label: 'Scala' },
	{ value: 'scss', label: 'Sass (SCSS)' },
	{ value: 'sql', label: 'SQL' },
	{ value: 'svg', label: 'SVG' },
	{ value: 'swift', label: 'Swift' },
	{ value: 'toml', label: 'TOML' },
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'xml', label: 'XML' },
	{ value: 'yaml', label: 'YAML' }
] as const satisfies SelectItemSingle<string>[];
export type CodeLanguageItem = (typeof codeLanguageSelect)[number];

export function registerEditorPlugins(editor: LexicalEditor) {
	return mergeRegister(
		registerRichText(editor),
		registerCodeHighlighting(editor),
		registerDragonSupport(editor),
		registerHistory(editor, createEmptyHistoryState(), 300),
		registerPluginPasteLinkReplacer(editor),
		registerListItemEscape(editor),
		registerDecoratorNodeBase(editor),
		registerImagePlugin(editor),
		registerImageUploaderPlugin(editor),
		registerDividerBlock(editor)
	);
}

// If only exist an empty paragraph / heading node, the editor appears to have no input
export function isShowEditorPlaceholder() {
	const rootNode = $getRoot();
	if (rootNode.getChildrenSize() === 1 && rootNode.getTextContentSize() === 0) {
		const firstBlockNode = rootNode.getFirstChild();
		return $isParagraphNode(firstBlockNode) || $isHeadingNode(firstBlockNode);
	} else {
		return false;
	}
}

// Indicates that the editor does not contain any meaningful content
export function isEditorEmpty(editor: LexicalEditor) {
	const nodeMap = editor.getEditorState()._nodeMap;
	for (const [_, node] of nodeMap) {
		if (
			[ParagraphNode, CodeNode, HeadingNode, ListNode, QuoteNode].some(
				(instance) => node instanceof instance
			)
		) {
			if (node.getTextContentSize() !== 0) {
				return false;
			}
		} else if (node instanceof ImageNode) {
			return false;
		}
	}
	return true;
}

// Find block node of lexical editor state, not text node in the block node
export function findSelectedStartBlock(selection: RangeSelection) {
	return selection.anchor.getNode().getTopLevelElement();
}

export function getSelectedBlock() {
	const selection = $getSelection();
	if (selection == null) {
		return { selection, selectedBlock: null };
	}

	if ($isRangeSelection(selection)) {
		const selectedNodes = selection.getNodes();
		const selectedNodesEnd = selectedNodes[selectedNodes.length - 1];
		const selectedBlock = selectedNodesEnd.getTopLevelElement() as BlockNode | null;
		return { selection, selectedBlock };
	} else {
		const selectedBlock = selection.getNodes()[0]?.getTopLevelElement() as BlockNode | null;
		return { selection, selectedBlock };
	}
}

export function insertBlockNodeToNext<T extends LexicalNode>(
	originBlock: BlockNode,
	insertNode: T
) {
	originBlock.selectEnd();
	const firstBlockNode = $getRoot().getFirstChild();
	// "insertNodeToNearestRoot" inserts the specify block and the empty paragraph block
	const insertedNode = $insertNodeToNearestRoot(insertNode);
	insertedNode.getNextSibling()?.selectStart();

	if (
		!$isDecoratorNode(originBlock) &&
		originBlock.getTextContentSize() === 0 &&
		firstBlockNode?.getKey() !== originBlock.getKey()
	) {
		originBlock.remove();
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
