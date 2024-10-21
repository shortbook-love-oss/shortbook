<script lang="ts">
	import IconFileUpload from '~icons/mdi/file-upload-outline';

	type Props = {
		text?: string;
		onDrop: (files: FileList) => void;
	};
	let { text, onDrop }: Props = $props();

	let isDragging = $state(false);

	function isFileDragging(items: DataTransferItemList) {
		for (let i = 0; i < items.length; i++) {
			if (items[i].kind === 'string') {
				return false;
			}
		}
		return true;
	}

	function showDragStatus(event: DragEvent) {
		if (event.dataTransfer && isFileDragging(event.dataTransfer.items)) {
			event.preventDefault();
			isDragging = true;
		}
	}

	function onDropOver(event: DragEvent) {
		if (event.dataTransfer && isFileDragging(event.dataTransfer.items)) {
			event.preventDefault();
		}
	}

	function onDragLeave(event: DragEvent) {
		if (event.dataTransfer && isFileDragging(event.dataTransfer.items)) {
			event.preventDefault();
			isDragging = false;
		}
	}

	function onDropItems(event: DragEvent) {
		if (event.dataTransfer && isFileDragging(event.dataTransfer.items)) {
			event.preventDefault();
			isDragging = false;
			onDrop(event.dataTransfer.files);
		}
	}
</script>

<svelte:body ondragenter={showDragStatus} ondragover={onDropOver} ondrop={onDropItems} />

<div
	class="fixed start-0 top-0 z-50 h-dvh w-dvw items-center justify-center gap-2 bg-stone-50/80 max-xs:flex-col {isDragging
		? 'flex'
		: 'hidden'}"
>
	<IconFileUpload width="64" height="64" />
	{#if text}
		<p class="text-3xl">{text}</p>
	{/if}
</div>
<div
	class="fixed start-0 top-0 z-50 h-dvh w-dvw {isDragging ? '' : 'hidden'}"
	ondragleave={onDragLeave}
	aria-hidden="true"
></div>
