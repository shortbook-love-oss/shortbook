<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm, filesProxy } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { schema } from '$lib/validation/schema/support/ticket-create';
	import File from '$lib/components/modules/form/file.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import Ogp from '$lib/components/service/ogp.svelte';

	let { data } = $props();

	const { form, enhance, capture, restore, validateForm, submitting, message, errors } = superForm(
		data.form,
		{ validators: zod(schema) }
	);
	export const snapshot = { capture, restore };
	const filesAttach = filesProxy(form, 'files' as never);

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
	<title>Contact | ShortBook</title>
	<Ogp pageType="website" title="Contact | ShortBook" />
</svelte:head>

<section class="mx-auto mb-8 max-w-xl text-lg">
	<h1 class="mb-8 text-4xl font-semibold">Contact</h1>
	<p>We will check your email and reply within 18 hours.</p>
</section>
<Form
	method="POST"
	action={$page.url.pathname + $page.url.search}
	enctype="multipart/form-data"
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Send message"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={400 <= $page.status && $page.status <= 599 ? $message : ''}
	class="mx-auto max-w-xl"
>
	<Select
		bind:value={$form.categoryKeyName as string}
		name="categoryKeyName"
		list={data.contactCategories}
		required={true}
		label="Category"
		errorMessages={$errors.categoryKeyName}
		className="mb-8 max-w-96"
	/>
	<TextField
		bind:value={$form.email}
		type="email"
		name="email"
		autocomplete="email"
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
		label="Attachment files"
		multiple={true}
		maxSize={20}
		errorMessages={$errors.files}
		className="mb-8 w-full max-w-96"
	/>
	{#if data.isHitLimitRate}
		<p class="mb-8">
			For security reasons, there is a limit to the number of times you can send your message.
			Please try again in an hour.
		</p>
	{/if}
</Form>
