<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/book-update';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import BookCoverEdit from '$lib/components/service/write/book-cover-edit.svelte';

	export let data;

	const { form, enhance, capture, restore, validateForm, submitting, message, errors } = superForm(
		data.form,
		{
			resetForm: false, // Prevents reverting to initial value after submission
			validators: zod(schema),
			validationMethod: 'onblur'
		}
	);
	const actionUrl = removeLangTagFromPath($page.url.pathname);
	export const snapshot = { capture, restore };
	let isEnableJS = false;
	onMount(() => (isEnableJS = true));

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => {
			hasVaild = result.valid;
		});
	}
	const formObserver = form.subscribe(() => {
		validateBackground();
	});
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	function applyChildChange(event: CustomEvent<{ book: typeof $form }>) {
		form.set({ ...event.detail.book });
	}
</script>

<svelte:head>
	<title>Write a new book | ShortBook</title>
</svelte:head>

<Form
	method="POST"
	action={actionUrl}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400 ? $message : ''}
>
	<div
		class="mb-8 flex flex-col items-center justify-center gap-x-16 gap-y-8 lg:flex-row lg:items-stretch"
	>
		<div class="w-full max-w-xl shrink-0 gap-8 lg:w-60">
			<h1 class="break-words text-2xl font-semibold">Write a new book</h1>
		</div>
		<div class="w-full max-w-xl overflow-x-hidden break-words">
			<TextField
				bind:value={$form.title}
				name="title"
				required={true}
				label="Title"
				errorMessages={$errors.title}
				className="mb-8"
			/>
			<TextField
				bind:value={$form.subtitle}
				name="subtitle"
				label="Subtitle"
				errorMessages={$errors.subtitle}
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
				bind:value={$form.prologue}
				name="prologue"
				label="Prologue"
				errorMessages={$errors.prologue}
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
				className="hidden"
			/>
		</div>
		<div class="-mt-4 shrink-0 lg:w-48 xl:w-60">
			<BookCoverEdit
				book={$form}
				penName={data.penName}
				errors={$errors}
				on:input={applyChildChange}
			/>
		</div>
	</div>
	<div class="mx-auto max-w-xl">
		<div class="w-full">
			<SubmitButton hasInvalid={!hasVaild && isEnableJS} {$submitting}>Publish book</SubmitButton>
		</div>
	</div>
	<div slot="submit"></div>
</Form>
