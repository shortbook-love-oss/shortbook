<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import IconArrowDownThin from '~icons/mdi/arrow-down-thin';
	import IconDelete from '~icons/mdi/trash-can-outline';
	import IconTranslate from '~icons/mdi/translate';
	import { page } from '$app/stores';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/book/update';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import HeaderArea from '$lib/components/layouts/header-area.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import Number from '$lib/components/modules/form/number.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import SubmitText from '$lib/components/modules/form/submit-text.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import MessageInfo from '$lib/components/modules/information/message-info.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import BookCoverEdit from '$lib/components/service/write/book-cover-edit.svelte';
	import InputPoint from '$lib/components/service/write/input-point.svelte';
	import PricePreview from '$lib/components/service/write/price-preview.svelte';
	import TranslateLanguageSelect from '$lib/components/service/write/translate-language-select.svelte';
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
				href="/write/{$page.params.bookId}{$page.url.search}"
				class="flex shrink-0 items-center gap-2 rounded-ee-[0.4375rem] p-2.5 hover:bg-stone-200 focus:bg-stone-200"
				title="Back to book contents editor"
			>
				<IconArrowLeft width="24" height="24" class="rtl:rotate-180" />
				<p class="text-lg leading-none">Back to edit</p>
			</a>
		</HeaderArea>
	{/snippet}

	<!-- Edit area -->
	{#snippet contents()}
		<div class="flex flex-col items-center px-4 pb-24 pt-16">
			<div class="w-full max-w-[640px]">
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
					<p class="text-lg">Publish setting of</p>
					<h1 class="mb-12 whitespace-pre-wrap break-words text-3xl font-semibold">
						"{data.initTitle}"
					</h1>
					<TextField
						bind:value={$form.urlSlug}
						name="urlSlug"
						required={true}
						label="URL string"
						errorMessages={$errors.urlSlug}
						className="mb-1"
					/>
					<p class="mb-12 break-words">
						{$page.url.origin}/@{$page.data.signInUser.keyHandle}/book/{$form.urlSlug}
					</p>
					<InputPoint
						bind:point={$form.buyPoint}
						errorMessages={$errors.buyPoint}
						className="mb-4 {data.hasPaidArea ? '' : 'hidden'}"
					/>
					{#if data.hasPaidArea}
						<PricePreview
							point={$form.buyPoint}
							userCurrencyCode={data.userCurrencyCode}
							currencyRates={data.currencyRateIndex}
							className="mb-12"
						/>
					{:else}
						<Number
							value={0}
							label="Selling point amount"
							name=""
							disabled={true}
							className="mb-2 w-48"
						/>
						<MessageInfo
							message="This book has no paid content. Publish as a free book."
							className="mb-12"
						/>
					{/if}
					{#if data.hasPaidArea}
						<section class="mb-12">
							<h2 class="mb-2 text-lg font-semibold">Reach it to the world!</h2>
							<TranslateLanguageSelect
								allCheckerName="isTranslateToAll"
								bind:isAllChecked={$form.isTranslateToAll}
								eachCheckerName="translateLanguages"
								bind:translateLanguages={$form.translateLanguages}
								nativaLanguage={$form.targetLanguage}
							>
								{#snippet sourceLanguage()}
									<Select
										bind:value={$form.targetLanguage as string}
										name="targetLanguage"
										list={data.langTags}
										label="Native language"
										errorMessages={$errors.targetLanguage}
										className="max-w-52"
									/>
								{/snippet}
							</TranslateLanguageSelect>
						</section>
					{:else}
						<Select
							bind:value={$form.targetLanguage as string}
							name="targetLanguage"
							list={data.langTags}
							label="Native language"
							errorMessages={$errors.targetLanguage}
							className="mb-12 max-w-72"
						/>
					{/if}
					<BookCoverEdit
						bind:baseColorStart={$form.baseColorStart}
						bind:baseColorEnd={$form.baseColorEnd}
						bind:baseColorDirection={$form.baseColorDirection}
						bind:titleFontSize={$form.titleFontSize}
						bind:titleAlign={$form.titleAlign}
						bind:titleColor={$form.titleColor}
						bind:subtitleFontSize={$form.subtitleFontSize}
						bind:subtitleAlign={$form.subtitleAlign}
						bind:subtitleColor={$form.subtitleColor}
						bind:writerAlign={$form.writerAlign}
						bind:writerColor={$form.writerColor}
						title={data.initTitle}
						subtitle={data.initSubtitle}
						penName={$page.data.signInUser.penName}
						errors={$errors}
						className="mb-12 mx-auto w-fit"
					/>
					{#snippet submit()}
						<div class="flex flex-wrap items-center gap-4">
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
										form="book_item_delete_form"
										isLoading={$submitting}
										className="mx-auto"
									>
										<span class="text-red-800">Delete</span>
									</SubmitText>
								{/snippet}
							</Dialog>
						</div>
					{/snippet}
				</Form>
				<form
					method="POST"
					action="/write/{$page.params.bookId}?/delete"
					id="book_item_delete_form"
					class="hidden"
				></form>
			</div>
		</div>
	{/snippet}
	{#snippet footerNav()}{/snippet}
</LayoutRule>
