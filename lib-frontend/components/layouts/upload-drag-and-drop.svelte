<script lang="ts">
	import IconFileUpload from '~icons/mdi/file-upload-outline';

	type Props = {
		text?: string;
		onDrop: (files: FileList) => void;
	};
	let { text, onDrop }: Props = $props();

	let isDragging = $state(false);

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function onDragLeave() {
		isDragging = false;
	}

	function onDropFiles(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer?.files.length) {
			onDrop(event.dataTransfer.files);
		}
		isDragging = false;
	}
</script>

<svelte:body ondragover={onDragOver} ondrop={onDropFiles} />

<div
	class="fixed left-0 top-0 z-50 h-dvh w-dvw items-center justify-center gap-2 bg-stone-50/80 max-xs:flex-col {isDragging
		? 'flex'
		: 'hidden'}"
>
	<IconFileUpload width="64" height="64" />
	{#if text}
		<p class="text-3xl">{text}</p>
	{/if}
</div>
<div
	class="fixed left-0 top-0 z-50 h-dvh w-dvw {isDragging ? '' : 'hidden'}"
	ondragleave={onDragLeave}
	aria-hidden="true"
></div>
