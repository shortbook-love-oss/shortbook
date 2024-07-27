<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm, filesProxy } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/contact-create';
	import File from '$lib/components/modules/form/file.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';

	export let data;

	const { form, enhance, capture, restore, validateForm, submitting, message, errors } = superForm(
		data.form,
		{ validators: zod(schema) }
	);
	export const snapshot = { capture, restore };
	const filesAttach = filesProxy(form, 'files' as never);

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	const actionUrl = removeLangTagFromPath($page.url.pathname);
</script>

<svelte:head>
	<title>Contact | ShortBook</title>
</svelte:head>

<section class="mx-auto mb-8 max-w-xl text-lg">
	<h1 class="mb-8 text-4xl font-semibold">Contact</h1>
	<p>We will check your email and reply within 24 hours.</p>
</section>
<Form
	method="POST"
	action={actionUrl}
	enctype="multipart/form-data"
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Send message"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400 ? $message : ''}
	class="mx-auto max-w-xl"
>
	<Select
		bind:value={$form.categoryKeyName}
		name="categoryKeyName"
		list={data.contactCategories}
		required={true}
		label="Category"
		errorMessages={$errors.categoryKeyName}
		className="mb-8 max-w-96"
	/>
	<TextField
		bind:value={$form.email}
		name="email"
		required={true}
		label="Email"
		placeholder="your-address@email.example"
		errorMessages={$errors.email}
		className="mb-8"
	/>
	<TextArea
		bind:value={$form.description}
		name="description"
		required={true}
		label="Description"
		errorMessages={$errors.description}
		className="mb-8"
	/>
	<File
		filesProxy={filesAttach}
		name="files"
		multiple="true"
		label="Attachment files"
		buttonSubLabel="Max size 20MB"
		errorMessages={$errors.files}
		className="mb-8 w-full max-w-96"
	/>
</Form>
