<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { getUnitByteLength } from '$lib/utilities/file';
	import { languageAndNotSelect } from '$lib/utilities/language';
	import { schema } from '$lib/validation/schema/user/album/image-update';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import SubmitText from '$lib/components/modules/form/submit-text.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import { albumImageAiSelect, albumImageSensitiveSelect, type AlbumImageItem } from './album';

	type Props = {
		imageData: AlbumImageItem;
	};
	let { imageData }: Props = $props();

	const { form, enhance, validateForm, submitting, message, errors } = superForm(
		imageData.editForm,
		{
			validators: zod(schema)
		}
	);

	let isEnableJS = $state(false);
	onMount(() => (isEnableJS = true));

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = $state(true);
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());
</script>

<svelte:head>
	<title>Writer's album | ShortBook</title>
</svelte:head>

<Dialog
	name="album-image-edit-{imageData.id}"
	title="Edit image data"
	openerClass="rounded-md"
	openerCoverClass="rounded-md hover:bg-stone-500/30 focus:bg-stone-500/30"
	dialogSizeClass="max-w-3xl"
>
	{#snippet opener()}
		<img
			src="{imageData.filePath}?ext={imageData.toExtension}&w=144&h=144&q=80"
			alt={imageData.alt}
			width="144"
			height="144"
			decoding="async"
			class="rounded-md bg-white"
		/>
	{/snippet}
	<div class="flex flex-col items-start gap-x-8 gap-y-4 sm:flex-row">
		<div
			class="top-0 flex shrink-0 flex-wrap items-start gap-x-4 gap-y-8 py-2 sm:sticky sm:flex-col"
		>
			<a
				href="{imageData.filePath}?ext={imageData.toExtension}&q=100"
				target="_blank"
				class="inline-block"
			>
				<img
					src="{imageData.filePath}?ext={imageData.toExtension}&w=144&h=144&q=80"
					alt={imageData.alt}
					width="144"
					height="144"
					class="h-28 w-28 rounded-md bg-white xs:h-36 xs:w-36"
				/>
			</a>
			<dl class="-mt-1 leading-tight xs:text-[1.125rem]">
				<dt>File size</dt>
				<dd class="mb-3 text-2xl xs:text-3xl">{getUnitByteLength(imageData.byteLength, 1)}</dd>
				<dt>Width</dt>
				<dd class="mb-3 text-2xl xs:text-3xl">{imageData.width} px</dd>
				<dt>Height</dt>
				<dd class="text-2xl xs:text-3xl">{imageData.height} px</dd>
			</dl>
		</div>
		<Form
			method="POST"
			action="/redirect/album/{imageData.id}/update"
			{enhance}
			hasInvalid={!hasVaild}
			isLoading={$submitting}
			submitLabel="Update image data"
			errorMessage={$page.status === 400 ? $message : ''}
			class="w-full"
		>
			<TextField
				bind:value={$form.name as string}
				name="name"
				required={true}
				label="Image name"
				errorMessages={$errors.name}
				className="mb-8"
			/>
			<TextField
				bind:value={$form.alt as string}
				name="alt"
				label="Alternative text (alt)"
				errorMessages={$errors.alt}
				className="mb-8"
			/>
			<Select
				bind:value={$form.languageInImage as string}
				name="languageInImage"
				list={languageAndNotSelect}
				label="Language used in the image"
				errorMessages={$errors.languageInImage}
				className="mb-8 max-w-72"
			/>
			<TextField
				bind:value={$form.place as string}
				name="place"
				label="Filming region"
				errorMessages={$errors.place}
				className="mb-8"
			/>
			<TextField
				bind:value={$form.copyrightOwner as string}
				name="copyrightOwner"
				label="Copyright owner"
				errorMessages={$errors.copyrightOwner}
				className="mb-8"
			/>
			<TextField
				bind:value={$form.targetInImage as string}
				name="targetInImage"
				label="Who is in the photo?"
				errorMessages={$errors.targetInImage}
				className="mb-8"
			/>
			<TextField
				bind:value={$form.licenseUrl as string}
				type="url"
				name="licenseUrl"
				label="License information URL"
				placeholder="e.g. https://license-source.example"
				errorMessages={$errors.licenseUrl}
				className="mb-8"
			/>
			<Select
				bind:value={$form.isSensitive as number}
				name="isSensitive"
				list={albumImageSensitiveSelect}
				label="Flag as sensitive?"
				errorMessages={$errors.isSensitive}
				className="mb-8"
			/>
			<Select
				bind:value={$form.isAi as number}
				name="isAi"
				list={albumImageAiSelect}
				label="Flag as using AI?"
				errorMessages={$errors.isAi}
				className="mb-8"
			/>
			{#snippet submit()}
				<div class="mb-2 flex flex-wrap items-center gap-4 max-sm:justify-center">
					<SubmitButton hasInvalid={!hasVaild && isEnableJS} isLoading={$submitting}>
						Save changed
					</SubmitButton>
					<SubmitText formaction="/redirect/album/{imageData.id}/delete" isLoading={$submitting}>
						<span class="text-red-800">Delete image</span>
					</SubmitText>
				</div>
			{/snippet}
		</Form>
	</div>
</Dialog>
