<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/user/album/image-update';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import { albumImageAiSelect, albumImageSensitiveSelect, type AlbumImageItem } from './album';

	type Props = {
		imageData: AlbumImageItem;
		imageHref: string;
	};
	let { imageData, imageHref }: Props = $props();

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
		<img src={imageHref} alt={imageData.alt} width="144" height="144" class="rounded-md bg-white" />
	{/snippet}
	<div class="flex flex-col items-center gap-x-8 gap-y-4 sm:flex-row">
		<a
			href="{imageData.filePath}?ext={imageData.toExtension}&q=100"
			target="_blank"
			class="inline-block shrink-0"
		>
			<img
				src={imageHref}
				alt={imageData.alt}
				width="144"
				height="144"
				class="my-4 h-36 w-36 rounded-md bg-white"
			/>
		</a>
		<Form
			method="POST"
			action="/redirect/album/{imageData.id}/update"
			{enhance}
			hasInvalid={!hasVaild}
			isLoading={$submitting}
			submitLabel="Update image data"
			successMessage={$page.status === 200 ? $message : ''}
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
			<TextField
				bind:value={$form.place as string}
				name="place"
				label="Filming region"
				errorMessages={$errors.place}
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
			<TextField
				bind:value={$form.creditNotice as string}
				name="creditNotice"
				label="Credit notice"
				errorMessages={$errors.creditNotice}
				className="mb-8"
			/>
			<Select
				bind:value={$form.isSensitive as number}
				name="isSensitive"
				list={albumImageSensitiveSelect}
				label="Flag as sensitive?"
				errorMessages={$errors.isSensitive}
				className="mb-8 max-w-72"
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
					<SubmitButton
						formaction="{removeLanguageTagFromPath($page.url.pathname)}/{imageData.id}?/delete"
						isLoading={$submitting}
					>
						<span class="text-red-800">Delete image</span>
					</SubmitButton>
				</div>
			{/snippet}
		</Form>
	</div>
</Dialog>
