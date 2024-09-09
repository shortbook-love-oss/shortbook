<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { filesProxy, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { imageMIMEextension } from '$lib/utilities/file';
	import { schema } from '$lib/validation/schema/user/album-update';
	import File from '$lib/components/modules/form/file.svelte';
	import Form from '$lib/components/modules/form/form.svelte';

	let { data } = $props();

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		validators: zod(schema)
	});
	const fileProfileImage = filesProxy(form, 'images');

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
	errorMessage={$page.status === 400 ? $message : ''}
>
	<File
		filesProxy={fileProfileImage}
		name="images"
		required={true}
		multiple
		acceptTypes={Object.keys(imageMIMEextension)}
		label="Select new album images"
		buttonSubLabel="Max size 28 MB"
		errorMessages={$errors.images}
		className="mb-8 w-full max-w-96"
	/>
</Form>
