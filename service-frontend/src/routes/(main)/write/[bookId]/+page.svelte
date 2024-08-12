<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import IconDelete from '~icons/mdi/trash-can-outline';
	import { page } from '$app/stores';
	import { schema } from '$lib/validation/schema/book-update';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import SubmitText from '$lib/components/modules/form/submit-text.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import BookCoverEdit from '$lib/components/service/write/book-cover-edit.svelte';
	import PricePreview from '$lib/components/service/write/price-preview.svelte';

	export let data;

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema),
		validationMethod: 'onblur'
	});

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
	<title>Edit book | ShortBook</title>
</svelte:head>

<Form
	method="POST"
	action="{$page.url.pathname}?/update"
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
		<div class="w-full max-w-xl shrink-0 text-lg lg:w-48 lg:justify-end">
			<p>Editing</p>
			<h1 class="whitespace-pre-wrap break-words text-xl font-semibold">
				{data.initTitle}
			</h1>
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
				min="50"
				max="1000000"
				type="number"
				bind:value={$form.buyPoint}
				name="buyPoint"
				label="Selling point"
				errorMessages={$errors.buyPoint}
				className="mb-8 max-w-40"
			/>
			<PricePreview
				point={$form.buyPoint}
				selectedCurrencyKey={data.selectedCurrencyKey}
				currencyRates={data.currencyRates}
			/>
		</div>
		<div class="shrink-0 lg:w-48">
			<div class="w-fit lg:-mx-4 lg:-mt-4">
				<BookCoverEdit
					book={$form}
					penName={data.penName}
					errors={$errors}
					on:input={applyChildChange}
				/>
			</div>
		</div>
	</div>
	<div class="flex justify-center gap-x-16">
		<div class="hidden w-48 shrink-0 lg:block" aria-hidden="true" />
		<div class="flex w-full max-w-xl items-center gap-8 max-sm:flex-col">
			<SubmitButton hasInvalid={!hasVaild} isLoading={$submitting}>
				{data.status === 0 ? 'Publish book' : 'Republish book'}
			</SubmitButton>
			<Dialog name="delete" openerClass="rounded-lg" dialogSizeClass="max-w-fit">
				<NavLinkSmall slot="opener" name="Delete" className="text-red-800">
					<IconDelete width="24" height="24" />
				</NavLinkSmall>
				<p>Do you want to delete it?</p>
				<SubmitText
					slot="actions"
					formaction="{removeLanguageTagFromPath($page.url.pathname)}?/delete"
					hasInvalid={!hasVaild}
					isLoading={$submitting}
					className="mx-auto"
				>
					<span class="text-red-800">Delete</span>
				</SubmitText>
			</Dialog>
		</div>
		<div class="hidden w-48 shrink-0 lg:block" aria-hidden="true" />
	</div>
	<div slot="submit" />
</Form>
