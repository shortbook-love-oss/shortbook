import {
	$createNodeSelection,
	$setSelection,
	getNearestEditorFromDOMNode,
	type NodeKey
} from 'lexical';
import { ImageNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-editor/node';
import { editorImageMaxWidth } from '$lib/components/modules/wysiwyg-editor/editor';
import { getUrlObject } from '$lib/utilities/url';
import { allowedSize } from '$lib-backend/utilities/infrastructure/image';

export const imageNodeAttr = 'data-lexical-node-image';
export const imageNodeActivatorAttr = 'data-lexical-node-image-activator';
export const imageNodeCaptionAttr = 'data-lexical-node-image-caption';

export function createImageNodeDOM(node: ImageNode, isEditPage: boolean) {
	const nodeRoot = document.createElement('div');
	nodeRoot.className = 'my-4 text-center';
	if (isEditPage) {
		nodeRoot.setAttribute(imageNodeAttr, node.getKey());
		nodeRoot.contentEditable = 'false';
	}

	// -------------------- Image area --------------------
	const imageWrap = document.createElement('picture');
	imageWrap.className = 'block mx-[calc(50%-50vw)]';

	const narrowVer = document.createElement('source');
	const narrowSrc = getUrlObject(node.getSrc());
	if (node.getWidth() > 448 && narrowSrc) {
		// If narrow device and large image, show small-resized image
		narrowVer.media = '(max-width: 448px)';
		// Max-width of narrow image is 480 - margins (16*2)
		const narrowImageWidth: (typeof allowedSize)[number] = 448;
		narrowSrc.searchParams.set('w', narrowImageWidth + '');
		narrowSrc.searchParams.delete('h');
		narrowVer.srcset = narrowSrc.href;
		imageWrap.appendChild(narrowVer);
	}

	const image = document.createElement('img');
	image.src = node.getSrc();
	image.alt = node.getAlt();
	image.width = node.getWidth();
	image.height = node.getHeight();
	image.decoding = 'async';
	image.className = 'inline-block';
	image.setAttribute(imageNodeActivatorAttr, node.getKey());
	image.style.maxWidth = `min(${editorImageMaxWidth}px, 100%)`;
	if (isEditPage) {
		image.draggable = false;
	}
	imageWrap.appendChild(image);

	nodeRoot.appendChild(imageWrap);

	if (isEditPage) {
		const captionWrap = document.createElement('figure');
		captionWrap.className = 'relative mt-2 text-[1.25rem] leading-[1.5] text-stone-600';

		// -------------------- Caption area --------------------
		const caption = document.createElement('p');
		caption.className = 'peer min-h-[1.5em] outline-none';
		caption.setAttribute(imageNodeCaptionAttr, node.getKey());
		caption.contentEditable = 'true';
		caption.innerText = '';

		if (node.getCaption()) {
			const captionFirstLine = document.createElement('div');
			captionFirstLine.innerText = node.getCaption();
			caption.appendChild(captionFirstLine);
		}

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
				elem.innerText = '';
			}
			focusToNearestNode(elem, node.getKey());
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
		captionWrap.appendChild(caption);

		// -------------------- Caption placeholder area --------------------
		const placeholder = document.createElement('figcaption');
		placeholder.className =
			'pointer-events-none absolute top-0 hidden w-full text-stone-400 peer-[:not(:focus):empty]:block';
		placeholder.innerText = 'Add caption ...';
		captionWrap.appendChild(placeholder);

		nodeRoot.appendChild(captionWrap);
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
