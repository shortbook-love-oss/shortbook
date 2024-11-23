import {
	DecoratorNode,
	type DOMExportOutput,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread
} from 'lexical';
import { createImageNodeDOM } from '$lib/components/modules/wysiwyg-editor/blocks/album-image/dom';
import type { BlockNode } from '$lib/components/modules/wysiwyg-editor/editor';
import type { AllowedToExtension } from '$lib-backend/utilities/infrastructure/image';

export type SerializedImageNode = Spread<
	{
		imageId: string;
		src: string;
		alt: string;
		width: number;
		height: number;
		toExtension: AllowedToExtension;
		caption: string;
	},
	SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<HTMLElement> {
	__imageId: string;
	__src: string;
	__alt: string;
	__width: number;
	__height: number;
	__toExtension: AllowedToExtension;
	__caption: string;

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
			node.__toExtension,
			node.__caption,
			node.__key
		);
	}

	constructor(
		imageId: string,
		src: string,
		alt: string,
		width: number,
		height: number,
		toExtension: AllowedToExtension,
		caption: string,
		key?: NodeKey
	) {
		super(key);

		this.__imageId = imageId;
		this.__src = src;
		this.__alt = alt;
		this.__width = width;
		this.__height = height;
		this.__toExtension = toExtension;
		this.__caption = caption;
	}

	// Render in Lexical editor
	decorate(): HTMLElement {
		return createImageNodeDOM(this, true);
	}

	createDOM(): HTMLElement {
		return createImageNodeDOM(this, true);
	}

	updateDOM(): boolean {
		return true;
	}

	// Render in output page
	exportDOM(): DOMExportOutput {
		return {
			element: createImageNodeDOM(this, false)
		};
	}

	static importJSON(serializedNode: SerializedImageNode): ImageNode {
		return $createImageNode(
			serializedNode.imageId,
			serializedNode.src,
			serializedNode.alt,
			serializedNode.width,
			serializedNode.height,
			serializedNode.toExtension,
			serializedNode.caption
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
			height: this.getHeight(),
			toExtension: this.getToExtension(),
			caption: this.getCaption()
		};
	}

	isInline(): boolean {
		return false;
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

	getToExtension(): AllowedToExtension {
		return this.__toExtension;
	}

	getCaption(): string {
		return this.__caption;
	}
	setCaption(caption: string): this {
		const self = this.getWritable();
		self.__caption = caption;
		return self;
	}
}

export function $createImageNode(
	imageId: string,
	src: string,
	alt: string,
	width: number,
	height: number,
	toExtension: AllowedToExtension,
	caption: string
): ImageNode {
	return new ImageNode(imageId, src, alt, width, height, toExtension, caption);
}

export function $isImageNode(node: BlockNode | null) {
	return node instanceof ImageNode;
}
