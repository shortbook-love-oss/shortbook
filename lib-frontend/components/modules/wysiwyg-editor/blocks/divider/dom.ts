import { DividerNode } from '$lib/components/modules/wysiwyg-editor/blocks/divider/node';

export const dividerNodeAttr = 'data-lexical-node-divider';
export const dividerNodeLineAttr = 'data-lexical-node-divider';

export function createDeviderNodeDOM(node: DividerNode, isEditPage: boolean) {
	if (isEditPage) {
		const nodeRoot = document.createElement('div');
		nodeRoot.setAttribute(dividerNodeAttr, node.getKey());
		nodeRoot.className = 'my-4 py-4';

		const line = document.createElement('hr');
		line.setAttribute(dividerNodeLineAttr, node.getKey());
		line.className = 'border-stone-300';
		nodeRoot.appendChild(line);

		return nodeRoot;
	} else {
		const nodeRoot = document.createElement('hr');
		nodeRoot.className = 'sb_bc__divider';

		return nodeRoot;
	}
}
