import {
	DecoratorNode,
	type DOMExportOutput,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread
} from 'lexical';
import { createDeviderNodeDOM } from '$lib/components/modules/wysiwyg-editor/blocks/divider/dom';
import type { BlockNode } from '$lib/components/modules/wysiwyg-editor/editor';

export type SerializedDividerNode = Spread<{}, SerializedLexicalNode>;

export class DividerNode extends DecoratorNode<HTMLElement> {
	static getType(): string {
		return 'divider';
	}

	static clone(node: DividerNode): DividerNode {
		return new DividerNode(node.__key);
	}

	constructor(key?: NodeKey) {
		super(key);
	}

	// Render in Lexical editor
	decorate(): HTMLElement {
		return createDeviderNodeDOM(this, true);
	}

	createDOM(): HTMLElement {
		return createDeviderNodeDOM(this, true);
	}

	updateDOM(): boolean {
		return false;
	}

	// Render in output page
	exportDOM(): DOMExportOutput {
		return {
			element: createDeviderNodeDOM(this, false)
		};
	}

	static importJSON(): DividerNode {
		return $createDividerNode();
	}

	exportJSON(): SerializedDividerNode {
		return {
			type: this.getType(),
			version: 1
		};
	}
}

export function $createDividerNode(): DividerNode {
	return new DividerNode();
}

export function $isDividerNode(node: BlockNode | null) {
	return node instanceof DividerNode;
}
