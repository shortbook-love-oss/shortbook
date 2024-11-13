import {
	DecoratorNode,
	type DOMExportOutput,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread
} from 'lexical';

export type SerializedImageUploadingNode = Spread<
	{
		fileName: string;
		dataUrl: string;
	},
	SerializedLexicalNode
>;

export class ImageUploadingNode extends DecoratorNode<HTMLElement> {
	__fileName: string;
	__dataUrl: string;

	static getType(): string {
		return 'image-uploader';
	}

	static clone(node: ImageUploadingNode): ImageUploadingNode {
		return new ImageUploadingNode(node.__fileName, node.__dataUrl, node.__key);
	}

	constructor(fileName: string, dataUrl: string, key?: NodeKey) {
		super(key);

		this.__fileName = fileName;
		this.__dataUrl = dataUrl;
	}

	// Render in Lexical editor
	decorate(): HTMLElement {
		return this.createDOM();
	}

	createDOM(): HTMLElement {
		const nodeRoot = document.createElement('div');
		nodeRoot.className = `relative flex flex-col my-4 w-full min-h-40 bg-stone-100 text-lg`;
		nodeRoot.contentEditable = 'false';

		const image = document.createElement('img');
		image.src = this.getDataUrl();
		image.className =
			'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 max-w-full max-h-full';
		nodeRoot.appendChild(image);

		const fileInfoWrap = document.createElement('div');
		fileInfoWrap.className = 'relative flex items-center justify-center flex-1 p-4 bg-stone-100/80';
		const fileInfo = document.createElement('p');
		fileInfo.className = 'break-words [word-break:break-word]';
		fileInfo.textContent = `Uploading "${this.getFileName()}" ...`;
		fileInfoWrap.appendChild(fileInfo);

		nodeRoot.appendChild(fileInfoWrap);

		return nodeRoot;
	}

	updateDOM(): boolean {
		return false;
	}

	// Render in output page
	exportDOM(): DOMExportOutput {
		return {
			element: null
		};
	}

	static importJSON(serializedNode: SerializedImageUploadingNode): ImageUploadingNode {
		return $createImageUploadingNode(serializedNode.fileName, serializedNode.dataUrl);
	}

	exportJSON(): SerializedImageUploadingNode {
		return {
			type: this.getType(),
			version: 1,
			fileName: this.getFileName(),
			dataUrl: this.getDataUrl()
		};
	}

	getFileName(): string {
		return this.__fileName;
	}

	getDataUrl(): string {
		return this.__dataUrl;
	}
}

export function $createImageUploadingNode(fileName: string, dataUrl: string): ImageUploadingNode {
	return new ImageUploadingNode(fileName, dataUrl);
}

export function $isImageUploadingNode(node: DecoratorNode<HTMLElement>) {
	return node instanceof ImageUploadingNode;
}
