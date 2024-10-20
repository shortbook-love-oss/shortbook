import {
	ElementNode,
	type DOMExportOutput,
	type NodeKey,
	type SerializedElementNode,
	type Spread
} from 'lexical';

export type SerializedImageNode = Spread<
	{
		imageId: string;
		src: string;
		alt: string;
		width: number;
		height: number;
	},
	SerializedElementNode
>;

export class ImageNode extends ElementNode {
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
	createDOM(): HTMLElement {
		const nodeRoot = document.createElement('div');
		nodeRoot.contentEditable = 'false';
		nodeRoot.className = 'my-4 max-w-full [&>br]:hidden';

		const image = document.createElement('img');
		image.src = this.__src;
		image.alt = this.__alt;
		image.width = this.__width;
		image.height = this.__height;
		image.decoding = 'async';
		image.draggable = false;
		nodeRoot.appendChild(image);

		return nodeRoot;
	}

	updateDOM(): false {
		return false;
	}

	exportDOM(): DOMExportOutput {
		const nodeRoot = document.createElement('div');
		nodeRoot.className = 'my-4 max-w-full [&>br]:hidden';

		const image = document.createElement('img');
		image.src = this.__src;
		image.alt = this.__alt;
		image.width = this.__width;
		image.height = this.__height;
		image.decoding = 'async';
		nodeRoot.appendChild(image);

		return {
			element: nodeRoot
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
			...super.exportJSON(),
			type: 'image',
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
	setSrc(src: string): void {
		this.__src = src;
	}

	getAlt(): string {
		return this.__alt;
	}
	setAlt(alt: string): void {
		this.__alt = alt;
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

export function $isImageNode(node: ElementNode) {
	return node instanceof ImageNode;
}
