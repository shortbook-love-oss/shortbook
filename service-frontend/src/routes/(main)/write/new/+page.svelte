<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/book-update';

	export let data;

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema),
		validationMethod: 'onblur'
	});
	const actionUrl = removeLangTagFromPath($page.url.pathname);

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());
</script>

<svelte:head>
	<title>Write a new book | ShortBook</title>
</svelte:head>

<h1 class="mb-8 text-2xl font-semibold">Write a new book</h1>
<Form
	method="POST"
	action={actionUrl}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Publish book"
	successMessage={$page.status === 200 && $message ? $message : ''}
	errorMessage={$page.status === 400
		? 'There was an error, please check your input and resubmit.'
		: ''}
>
	<TextField
		bind:value={$form.title}
		name="title"
		required={true}
		label="Title"
		errorMessages={$errors.title}
		className="mb-8"
	/>
	<Select
		bind:value={$form.nativeLanguage}
		name="nativeLanguage"
		list={data.langTags}
		required={true}
		label="Native language"
		errorMessages={$errors.nativeLanguage}
		className="mb-8 max-w-72"
	/>
	<TextArea
		bind:value={$form.introduction}
		name="introduction"
		label="Prologue"
		errorMessages={$errors.introduction}
		className="mb-8"
	/>
	<TextArea
		bind:value={$form.content}
		name="content"
		required={true}
		label="Main content"
		errorMessages={$errors.content}
		className="mb-8"
	/>
	<TextArea
		bind:value={$form.salesMessage}
		name="salesMessage"
		label="&quot;Read this!&quot; appeal"
		errorMessages={$errors.salesMessage}
		className="mb-8"
	/>
</Form>
