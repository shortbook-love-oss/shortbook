<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import IconDelete from '~icons/mdi/trash-can-outline';
	import { page } from '$app/stores';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/book/update';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import HeaderArea from '$lib/components/layouts/header-area.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import SubmitText from '$lib/components/modules/form/submit-text.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import BookCoverEdit from '$lib/components/service/write/book-cover-edit.svelte';
	import InputPoint from '$lib/components/service/write/input-point.svelte';
	import PricePreview from '$lib/components/service/write/price-preview.svelte';
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { data } = $props();

	let isEnableJS = $state(false);
	onMount(() => (isEnableJS = true));

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema),
		validationMethod: 'onblur'
	});

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
	<title>Publish "{data.initTitle}" | ShortBook</title>
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	{#snippet header()}
		<HeaderArea>
			<a
				href="/write/{$page.params.bookId}"
				class="flex shrink-0 items-center gap-2 rounded-ee-[0.4375rem] p-3 hover:bg-stone-200 focus:bg-stone-200"
				title="Back to my articles list"
			>
				<IconArrowLeft width="24" height="24" class="rtl:rotate-180" />
				<p class="text-lg leading-none">Back to edit</p>
			</a>
		</HeaderArea>
	{/snippet}

	<!-- Edit area -->
	{#snippet contents()}
		<div class="pb-24 pt-16">
			<Form
				method="POST"
				action="{$page.url.pathname}?/update"
				{enhance}
				hasInvalid={!hasVaild}
				isLoading={$submitting}
				successMessage={$page.status === 200 ? $message : ''}
				errorMessage={400 <= $page.status && $page.status <= 599 ? $message : ''}
				className="contents"
			>
				<div
					class="mb-8 flex flex-col items-center justify-center gap-x-12 gap-y-8 lg:flex-row lg:items-stretch"
				>
					<div class="w-full max-w-xl shrink-0 text-lg lg:w-40 lg:justify-end">
						<p>Editing</p>
						<h1 class="whitespace-pre-wrap break-words text-xl font-semibold">
							{data.initTitle}
						</h1>
					</div>
					<div class="w-full max-w-xl">
						<Select
							bind:value={$form.targetLanguage as string}
							name="targetLanguage"
							list={data.langTags}
							required={true}
							label="Native language"
							errorMessages={$errors.targetLanguage}
							className="mb-8 max-w-72"
						/>
						<TextField
							bind:value={$form.urlSlug}
							name="urlSlug"
							required={true}
							label="URL string"
							errorMessages={$errors.urlSlug}
							className="mb-1"
						/>
						<p class="mb-8 break-words">
							{$page.url.origin}/@{$page.data.signInUser.keyHandle}/book/{$form.urlSlug}
						</p>
						<InputPoint
							bind:point={$form.buyPoint}
							errorMessages={$errors.buyPoint}
							className="mb-8"
						/>
						<PricePreview
							point={$form.buyPoint}
							userCurrencyCode={data.userCurrencyCode}
							currencyRates={data.currencyRateIndex}
						/>
					</div>
					<div class="shrink-0 lg:w-40">
						<div class="w-fit lg:-mx-4 lg:-mt-3">
							<BookCoverEdit
								book={$form}
								title={data.initTitle}
								subtitle={data.initSubtitle}
								penName={$page.data.signInUser.penName}
								errors={$errors}
								oninput={applyChildChange}
							/>
						</div>
					</div>
				</div>
				<div class="flex justify-center gap-x-16">
					<div class="hidden w-40 shrink-0 lg:block" aria-hidden="true"></div>
					<div class="flex w-full max-w-xl flex-wrap items-center gap-4">
						<SubmitButton hasInvalid={!hasVaild && isEnableJS} isLoading={$submitting}>
							{data.status === 0 ? 'Publish book' : 'Republish book'}
						</SubmitButton>
						<SubmitText
							formaction="{removeLanguageTagFromPath($page.url.pathname)}?/draft"
							hasInvalid={!hasVaild && isEnableJS}
							isLoading={$submitting}>Save draft</SubmitText
						>
						<Dialog name="delete" openerClass="rounded-lg" dialogSizeClass="max-w-fit">
							{#snippet opener()}
								<NavLinkSmall name="Delete" className="text-red-800">
									<IconDelete width="24" height="24" />
								</NavLinkSmall>
							{/snippet}
							<p>Do you want to delete it?</p>
							{#snippet actions()}
								<SubmitText
									formaction="{removeLanguageTagFromPath($page.url.pathname)}?/delete"
									hasInvalid={!hasVaild && isEnableJS}
									isLoading={$submitting}
									className="mx-auto"
								>
									<span class="text-red-800">Delete</span>
								</SubmitText>
							{/snippet}
						</Dialog>
					</div>
					<div class="hidden w-40 shrink-0 lg:block" aria-hidden="true"></div>
				</div>
				{#snippet submit()}
					<div></div>
				{/snippet}
			</Form>
		</div>
	{/snippet}
	{#snippet footerNav()}{/snippet}
</LayoutRule>
