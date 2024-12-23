<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { filesProxy, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { imageMIMEextension } from '$lib/utilities/file';
	import { schema } from '$lib/validation/schema/user/album/image-create';
	import File from '$lib/components/modules/form/file.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import ImageDataEdit from '$lib/components/service/mypage/album/image-data-edit.svelte';

	let { data } = $props();

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		validators: zod(schema)
	});
	const fileImages = filesProxy(form, 'images');

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

<h1 class="mb-4 text-2xl font-semibold">Writer's album</h1>
<Form
	method="POST"
	action={$page.url.pathname}
	enctype="multipart/form-data"
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Upload images"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={400 <= $page.status && $page.status <= 599 ? $message : ''}
	class="mb-16"
>
	<File
		filesProxy={fileImages}
		name="images"
		label="Select new album images"
		multiple={true}
		required={true}
		maxSize={28}
		acceptTypes={Object.keys(imageMIMEextension)}
		errorMessages={$errors.images}
		className="mb-8"
	/>
</Form>
{#if data.albumImageList.length}
	<ul class="grid grid-cols-3 gap-4 xs:grid-cols-4">
		{#each data.albumImageList as image (image.id)}
			<li class="relative">
				<ImageDataEdit imageData={image} />
			</li>
		{/each}
	</ul>
{:else}
	<p>No images uploaded yet.</p>
{/if}
