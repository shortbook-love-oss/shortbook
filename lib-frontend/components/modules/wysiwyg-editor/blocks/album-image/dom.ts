import {
	$createNodeSelection,
	$setSelection,
	getNearestEditorFromDOMNode,
	type NodeKey
} from 'lexical';
import { ImageNode } from '$lib/components/modules/wysiwyg-editor/blocks/album-image/node';
import {
	editorImageMaxWidth,
	editorImageMaxWidthNarrow,
	getImageSizeForSrc
} from '$lib/components/modules/wysiwyg-editor/editor';
import { getAlbumImagePath } from '$lib/utilities/album';
import { getUrlObject } from '$lib/utilities/url';

export const imageNodeAttr = 'data-lexical-node-image';
export const imageNodeActivatorAttr = 'data-lexical-node-image-activator';

export function createImageNodeDOM(node: ImageNode, isEditPage: boolean) {
	const imageFilePath = getAlbumImagePath(node.getUserId(), node.getFileName());

	const nodeRoot = document.createElement('figure');
	nodeRoot.className = 'sb_bc__image';
	if (isEditPage) {
		nodeRoot.setAttribute(imageNodeAttr, node.getKey());
		nodeRoot.contentEditable = 'false';
	}

	// -------------------- Image area --------------------
	const link = document.createElement('a');
	if (isEditPage) {
		link.addEventListener('click', (ev) => ev.preventDefault());
	} else {
		link.href = `${imageFilePath}?ext=${node.getToExtension()}`;
		link.target = '_blank';
		link.rel = 'noreferrer ugc';
	}

	const imageWrap = document.createElement('picture');

	const narrowVer = document.createElement('source');
	const narrowImageSize = getImageSizeForSrc(node.getWidth(), editorImageMaxWidthNarrow);
	const narrowSrc = getUrlObject(
		`${imageFilePath}?ext=${node.getToExtension()}&${narrowImageSize}q=60`
	);
	if (node.getWidth() > editorImageMaxWidthNarrow && narrowSrc) {
		// If narrow device and large image, show small-resized image
		narrowVer.media = `(max-width: ${editorImageMaxWidthNarrow}px)`;
		// Max-width of narrow image is 480 - margins (16*2)
		narrowSrc.searchParams.set('w', editorImageMaxWidthNarrow + '');
		narrowSrc.searchParams.delete('h');
		narrowVer.srcset = narrowSrc.href;
		imageWrap.appendChild(narrowVer);
	}

	const imageSize = getImageSizeForSrc(node.getWidth(), editorImageMaxWidth);
	const image = document.createElement('img');
	image.src = `${imageFilePath}?ext=${node.getToExtension()}&${imageSize}q=60`;
	if (node.getAlt()) {
		image.alt = node.getAlt();
	}
	image.width = node.getWidth();
	image.height = node.getHeight();
	image.decoding = 'async';
	if (isEditPage) {
		image.setAttribute(imageNodeActivatorAttr, node.getKey());
		image.draggable = false;
	}
	imageWrap.appendChild(image);

	link.appendChild(imageWrap);
	nodeRoot.appendChild(link);

	if (isEditPage) {
		// -------------------- Caption area --------------------
		const caption = document.createElement('figcaption');
		caption.className =
			'min-h-[1.5em] outline-none before:text-stone-400 empty:[&:not(:focus)]:before:content-[attr(placeholder)]';
		caption.setAttribute('placeholder', 'Add caption ...');
		caption.contentEditable = 'true';
		caption.textContent = node.getCaption();

		caption.addEventListener('focus', (ev) => {
			const elem = ev.target as HTMLElement;
			focusToNearestNode(elem, node.getKey());
		});
		caption.addEventListener('input', (ev) => {
			ev.stopPropagation();
			if ((ev as InputEvent).isComposing) {
				return;
			}
			const elem = ev.target as HTMLElement;
			if (caption.textContent?.length === 0) {
				elem.textContent = '';
			}
			focusToNearestNode(elem, node.getKey());
		});
		caption.addEventListener('paste', (ev) => {
			ev.preventDefault();
			const beforeContent = caption.textContent;
			if (beforeContent == null) {
				return;
			}
			const nativeSelection = window.getSelection();
			if (nativeSelection == null) {
				return;
			}
			const pasteText = ev.clipboardData?.getData('text/plain');
			if (!pasteText) {
				return;
			}
			const insertText = pasteText.replace(/\n/g, ' ');

			// The image caption is plain-text and single line only, not rich-text
			const offsetStart = Math.min(nativeSelection.anchorOffset, nativeSelection.focusOffset);
			const offsetEnd = Math.max(nativeSelection.anchorOffset, nativeSelection.focusOffset);
			caption.textContent =
				beforeContent.slice(0, offsetStart) + insertText + beforeContent.slice(offsetEnd);

			const newSelectionOffset = offsetStart + insertText.length;
			nativeSelection.setPosition(caption.firstChild, newSelectionOffset);
		});
		caption.addEventListener('blur', (ev) => {
			const elem = ev.target as HTMLElement;
			const editor = getNearestEditorFromDOMNode(elem);
			editor?.update(() => {
				if (caption.textContent !== node.getCaption()) {
					node.setCaption(caption.textContent ?? '');
				}
			});
		});

		nodeRoot.appendChild(caption);
	} else {
		if (node.getCaption()) {
			const caption = document.createElement('figcaption');
			caption.textContent = node.getCaption();
			nodeRoot.appendChild(caption);
		}
	}

	return nodeRoot;
}

function focusToNearestNode(elemInNode: HTMLElement, nodeKey: NodeKey) {
	const editor = getNearestEditorFromDOMNode(elemInNode);
	editor?.update(() => {
		const selection = $createNodeSelection();
		selection.add(nodeKey);
		$setSelection(selection);
	});
}
