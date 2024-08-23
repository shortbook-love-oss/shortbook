<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/book-update';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import SubmitText from '$lib/components/modules/form/submit-text.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import BookCoverEdit from '$lib/components/service/write/book-cover-edit.svelte';
	import InputPoint from '$lib/components/service/write/input-point.svelte';
	import PricePreview from '$lib/components/service/write/price-preview.svelte';

	let { data } = $props();

	let isEnableJS = $state(false);
	onMount(() => (isEnableJS = true));

	const { form, enhance, capture, restore, validateForm, submitting, message, errors } = superForm(
		data.form,
		{
			resetForm: false, // Prevents reverting to initial value after submission
			validators: zod(schema),
			validationMethod: 'onblur'
		}
	);
	export const snapshot = { capture, restore };

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = $state(true);
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

	function applyChildChange(book: typeof $form) {
		form.set({ ...book });
	}
</script>

<svelte:head>
	<title>Write a new book | ShortBook</title>
</svelte:head>

<Form
	method="POST"
	action={$page.url.pathname}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400 ? $message : ''}
	className="contents"
>
	<div
		class="mb-8 flex flex-col items-center justify-center gap-x-16 gap-y-8 lg:flex-row lg:items-stretch"
	>
		<div class="flex w-full max-w-xl shrink-0 flex-col gap-8 lg:w-48 lg:items-end">
			<h1 class="break-words text-xl font-semibold">Write a new book</h1>
		</div>
		<div class="w-full max-w-xl">
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
				className="mb-8"
			/>
			<TextField
				bind:value={$form.keyName}
				name="keyName"
				required={true}
				label="URL string"
				errorMessages={$errors.keyName}
				className="mb-1"
			/>
			<p class="mb-8 break-words">{$page.url.origin}/@{data.userKeyName}/book/{$form.keyName}</p>
			<InputPoint bind:point={$form.buyPoint} errorMessages={$errors.buyPoint} className="mb-8" />
			<PricePreview
				point={$form.buyPoint}
				selectedCurrencyKey={data.selectedCurrencyKey}
				currencyRates={data.currencyRateIndex}
			/>
		</div>
		<div class="shrink-0 lg:w-48">
			<div class="w-fit lg:-mx-4 lg:-mt-3">
				<BookCoverEdit
					book={$form}
					penName={data.penName}
					errors={$errors}
					oninput={applyChildChange}
				/>
			</div>
		</div>
	</div>
	<div class="flex justify-center gap-x-16">
		<div class="hidden w-48 shrink-0 lg:block" aria-hidden="true"></div>
		<div class="flex w-full max-w-xl flex-wrap items-center gap-4">
			<SubmitButton
				formaction="{removeLanguageTagFromPath($page.url.pathname)}?/publish"
				hasInvalid={!hasVaild && isEnableJS}
				isLoading={$submitting}>Publish book</SubmitButton
			>
			<SubmitText
				formaction="{removeLanguageTagFromPath($page.url.pathname)}?/draft"
				hasInvalid={!hasVaild && isEnableJS}
				isLoading={$submitting}>Save draft</SubmitText
			>
		</div>
		<div class="hidden w-48 shrink-0 lg:block" aria-hidden="true"></div>
	</div>
	{#snippet submit()}
		<div></div>
	{/snippet}
</Form>
