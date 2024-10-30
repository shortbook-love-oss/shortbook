import {
	DecoratorNode,
	type DOMExportOutput,
	type EditorConfig,
	type LexicalEditor,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread
} from 'lexical';
import { editorImageMaxWidth } from '$lib/components/modules/wysiwyg-editor/editor';
import { getUrlObject } from '$lib/utilities/url';
import { allowedSize } from '$lib-backend/utilities/infrastructure/image';

export type SerializedImageNode = Spread<
	{
		imageId: string;
		src: string;
		alt: string;
		width: number;
		height: number;
	},
	SerializedLexicalNode
>;

export const imageActivatorAttr = 'data-lexical-node-image';

function createDOM(
	nodeKey: NodeKey,
	src: string,
	alt: string,
	width: number,
	height: number,
	isEditPage: boolean
) {
	const nodeRoot = document.createElement('picture');
	nodeRoot.className = 'block my-4 mx-[calc(50%-50vw)] text-center';
	if (isEditPage) {
		nodeRoot.contentEditable = 'false';
	}

	const narrowVer = document.createElement('source');
	const narrowSrc = getUrlObject(src);
	if (width > 448 && narrowSrc) {
		// If narrow device and large image, show small-resized image
		narrowVer.media = '(max-width: 448px)';
		// Max-width of narrow image is 480 - margins (16*2)
		const narrowImageWidth: (typeof allowedSize)[number] = 448;
		narrowSrc.searchParams.set('w', narrowImageWidth + '');
		narrowSrc.searchParams.delete('h');
		narrowVer.srcset = narrowSrc.href;
		nodeRoot.appendChild(narrowVer);
	}

	const image = document.createElement('img');
	image.src = src;
	image.alt = alt;
	image.width = width;
	image.height = height;
	image.decoding = 'async';
	image.className = 'inline-block';
	image.setAttribute(imageActivatorAttr, nodeKey);
	image.style.maxWidth = `min(${editorImageMaxWidth}px, 100%)`;
	if (isEditPage) {
		image.draggable = false;
	}
	nodeRoot.appendChild(image);

	return nodeRoot;
}

export class ImageNode extends DecoratorNode<HTMLElement> {
	__imageId: string;
	__src: string;
	__alt: string;
	__width: number;
	__height: number;

	static getType(): string {
		return 'image';
	}

	static clone(node: ImageNode): ImageNode {
		return new ImageNode(
			node.__imageId,
			node.__src,
			node.__alt,
			node.__width,
			node.__height,
			node.__key
		);
	}

	constructor(
		imageId: string,
		src: string,
		alt: string,
		width: number,
		height: number,
		key?: NodeKey
	) {
		super(key);

		this.__imageId = imageId;
		this.__src = src;
		this.__alt = alt;
		this.__width = width;
		this.__height = height;
	}

	// Render in Lexical editor
	decorate(_editor: LexicalEditor, config: EditorConfig): HTMLElement {
		return this.createDOM();
	}

	createDOM(): HTMLElement {
		return createDOM(
			this.getKey(),
			this.getSrc(),
			this.getAlt(),
			this.getWidth(),
			this.getHeight(),
			true
		);
	}

	updateDOM(): boolean {
		return false;
	}

	// Render in output page
	exportDOM(): DOMExportOutput {
		return {
			element: createDOM(
				this.getKey(),
				this.getSrc(),
				this.getAlt(),
				this.getWidth(),
				this.getHeight(),
				false
			)
		};
	}

	static importJSON(serializedNode: SerializedImageNode): ImageNode {
		return $createImageNode(
			serializedNode.imageId,
			serializedNode.src,
			serializedNode.alt,
			serializedNode.width,
			serializedNode.height
		);
	}

	exportJSON(): SerializedImageNode {
		return {
			type: this.getType(),
			version: 1,
			imageId: this.getImageId(),
			src: this.getSrc(),
			alt: this.getAlt(),
			width: this.getWidth(),
			height: this.getHeight()
		};
	}

	getImageId(): string {
		return this.__imageId;
	}

	getSrc(): string {
		return this.__src;
	}

	getAlt(): string {
		return this.__alt;
	}

	getWidth(): number {
		return this.__width;
	}

	getHeight(): number {
		return this.__height;
	}
}

export function $createImageNode(
	imageId: string,
	src: string,
	alt: string,
	width: number,
	height: number
): ImageNode {
	return new ImageNode(imageId, src, alt, width, height);
}

export function $isImageNode(node: DecoratorNode<HTMLElement>) {
	return node instanceof ImageNode;
}
