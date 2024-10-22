import {
	$getEditor,
	DecoratorNode,
	type DOMExportOutput,
	type EditorConfig,
	type LexicalEditor,
	type NodeKey,
	type SerializedLexicalNode,
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
	SerializedLexicalNode
>;

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
		const blockTheme = $getEditor()._config.theme.embedBlock ?? {};

		const nodeRoot = document.createElement('div');
		nodeRoot.className = blockTheme.base ?? '';
		nodeRoot.contentEditable = 'false';

		if (this.getSrc()) {
			const image = document.createElement('img');
			image.src = this.getSrc();
			image.alt = this.getAlt();
			image.width = this.getWidth();
			image.height = this.getHeight();
			image.decoding = 'async';
			image.draggable = false;
			nodeRoot.appendChild(image);
		} else {
			const placeholder = document.createElement('div');
			placeholder.className = 'px-4 py-16 bg bg-stone-100 text-center';
			placeholder.innerText = 'Uploading image ...';
			nodeRoot.appendChild(placeholder);
		}

		return nodeRoot;
	}

	updateDOM(): boolean {
		return true;
	}

	// Render in output page
	exportDOM(): DOMExportOutput {
		const nodeRoot = document.createElement('div');
		nodeRoot.className = 'my-4 max-w-full';

		const image = document.createElement('img');
		image.src = this.getSrc();
		image.alt = this.getAlt();
		image.width = this.getWidth();
		image.height = this.getHeight();
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

	setImageData(imageId: string, src: string, alt: string, width: number, height: number) {
		const self = this.getWritable();
		self.__imageId = imageId;
		self.__src = src;
		self.__alt = alt;
		self.__width = width;
		self.__height = height;
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
