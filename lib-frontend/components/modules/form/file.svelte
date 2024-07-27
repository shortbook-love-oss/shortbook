<script lang="ts">
	import type { Writable } from 'svelte/store';
	import IconCheck from '~icons/mdi/check';
	import IconImage from '~icons/mdi/file-image-outline';
	import IconFile from '~icons/mdi/file-outline';
	import type { FileInputErrorMessages, SelectedFile } from '$lib/utilities/file';

	export let filesProxy: Writable<any>;
	export let name: string;
	export let className = '';
	export let label = '';
	export let buttonSubLabel = '';
	export let required = false;
	export let acceptTypes: string[] | undefined = undefined; // Array of MIME types
	export let inputClass = '';
	export let errorMessages: any = { 0: undefined };

	let selectedFiles: SelectedFile[] = [];

	$: errorMsgs = Object.values((errorMessages as FileInputErrorMessages) ?? {})
		.flat()
		.filter(Boolean);
	// If can only upload images, it's an image uploader
	$: isImageUploader = (() => {
		if (!acceptTypes || !acceptTypes.length) {
			return false;
		}
		return acceptTypes.every((contentType) => {
			return contentType.startsWith('image/');
		});
	})();

	function updateSelectedList() {
		requestAnimationFrame(() => {
			const files = $filesProxy as FileList;
			selectedFiles?.forEach((selected) => {
				if (selected.dataUrl) {
					URL.revokeObjectURL(selected.dataUrl);
				}
			});
			// Limit layout shifts to once
			const localSelectedFiles = [];
			for (var i = 0; i < files.length; i++) {
				const file = files.item(i);
				let dataUrl = '';
				const key = Math.floor(Math.random() * 1e8);
				if (file) {
					if (file.type.startsWith('image/')) {
						// Keep data-URL to preview image files
						dataUrl = URL.createObjectURL(file);
					}
					localSelectedFiles.push({ file, dataUrl, key });
				}
			}
			selectedFiles = [...localSelectedFiles];
		});
	}
</script>

<label class="block {className}">
	{#if label}
		<div class="mb-2 flex items-end gap-4">
			<p class="text-lg">{label}</p>
			{#if required}
				<div class="pb-0.5 text-red-800">Required</div>
			{/if}
		</div>
	{/if}
	<div class="peer relative">
		<input
			{...$$restProps}
			bind:files={$filesProxy}
			type="file"
			{name}
			{required}
			accept={acceptTypes?.join()}
			class="peer w-full rounded-lg file:min-h-20 file:w-full file:appearance-none file:rounded-lg file:border-solid file:bg-white file:text-transparent hover:file:bg-stone-200 focus:file:bg-stone-200 {errorMsgs.length
				? 'file:border-2 file:border-red-700'
				: 'file:border file:border-stone-600'}"
			aria-invalid={errorMsgs?.length ? true : undefined}
			on:input={updateSelectedList}
		/>
		<div
			class="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-start gap-2 rounded-lg p-3 {inputClass}"
		>
			{#if isImageUploader}
				<IconImage width="48" height="48" class="text-stone-600" />
			{:else}
				<IconFile width="48" height="48" class="text-stone-600" />
			{/if}
			<div>
				<p class="text-lg">File select or drag</p>
				{#if buttonSubLabel}
					<p>{buttonSubLabel}</p>
				{/if}
			</div>
		</div>
	</div>
	<div class="hidden peer-has-[:valid]:block">
		{#if selectedFiles.length}
			<ul>
				{#each selectedFiles as selected (selected.key)}
					<li
						class="mt-2 flex items-center gap-4 rounded-lg border border-primary-700 bg-primary-50 p-4"
					>
						{#if selected.file.type.startsWith('image/')}
							<img src={selected.dataUrl} alt={selected.file.name} class="h-12 w-12 rounded-md" />
						{:else}
							<IconFile width="48" height="48" class="text-stone-600" />
						{/if}
						<div class="overflow-x-hidden">
							<p>Selected :</p>
							<p class="break-words font-semibold">{selected.file.name}</p>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
		<noscript class="mt-2 flex gap-2 text-emerald-800">
			<IconCheck width="24" height="24" />
			<p>File selected</p>
		</noscript>
	</div>
	{#if errorMsgs.length}
		<div class="mt-2 text-red-800">
			{#each errorMsgs as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</label>
