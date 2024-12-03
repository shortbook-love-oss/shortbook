<script lang="ts">
	import { onMount } from 'svelte';
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import { bookCreateUrlParam, type BookDraftUpdateResult } from '$lib/utilities/book';
	import { toLocaleDatetime } from '$lib/utilities/date';
	import {
		callbackParam,
		getLanguageTagFromUrl,
		removeLanguageTagFromPath,
		setLanguageTagToPath
	} from '$lib/utilities/url';
	import { validateOnlyVisibleChar } from '$lib/validation/rules/string';
	import HeaderArea from '$lib/components/layouts/header-area.svelte';
	import TextAreaSingle from '$lib/components/modules/form/text-area-single.svelte';
	import Editor from '$lib/components/modules/wysiwyg-editor/editor.svelte';
	import SalesMessage from '$lib/components/service/read/sales-message.svelte';
	import Meta from '$lib/components/service/meta.svelte';
	import MessageWarning from '$lib/components/modules/information/message-warning.svelte';
	import '$src/styles/book/content.scss';

	let { data } = $props();

	const requestLang = getLanguageTagFromUrl($page.url);

	let bookId = $state(data.bookId);
	let bookStatus = $state(data.bookStatus);
	let nativeLanguage = $state(data.nativeLanguage);
	let title = $state(data.form.data.title);
	let subtitle = $state(data.form.data.subtitle);
	let freeArea = $state(data.freeArea);
	let paidArea = $state(data.paidArea);
	let salesArea = $state(data.salesArea);

	let hasFreeArea = $state(false);
	let hasPaidArea = $state(false);
	let hasSalesArea = $state(false);

	const hasPublishedRevision = data.hasPublishedRevision;
	let initTitle = $state(data.initTitle);
	let lastUpdatedAt = $state(data.updatedAt);
	let isAutoSaved = $state(false);

	const callbackUrl = $derived(
		removeLanguageTagFromPath($page.url.searchParams.get(callbackParam) ?? '')
	);

	const isValidTitle = $derived(title && validateOnlyVisibleChar(title));
	const unpublishableReasons = $derived.by(() => {
		const reasons: string[] = [];
		if (!isValidTitle) {
			reasons.push('Title is required.');
		}
		if (!hasFreeArea && !hasPaidArea) {
			reasons.push('Either free or paid contents is required.');
		}
		return reasons;
	});

	const savedLabel = $derived.by(() => {
		if (lastUpdatedAt == null || data.updatedAt == null) {
			return undefined;
		}
		const datetime = toLocaleDatetime(lastUpdatedAt, requestLang);
		if (bookStatus === 1) {
			return `Published at ${datetime}`;
		} else if (Number(lastUpdatedAt) !== Number(data.updatedAt)) {
			return `Auto saved at ${datetime}`;
		} else {
			return `Last edited at ${datetime}`;
		}
	});

	onMount(() => {
		return () => window.clearTimeout(autoSaveTimeout);
	});

	let autoSaveTimeout = $state(0);
	function autoSave() {
		window.clearTimeout(autoSaveTimeout);
		autoSaveTimeout = window.setTimeout(async () => {
			autoSaveTimeout = 0;
			await save();
		}, 3000);
	}

	async function finish(event: MouseEvent) {
		if (autoSaveTimeout !== 0) {
			await save();
		}
		if (bookId !== '' && bookId !== bookCreateUrlParam) {
			const url = setLanguageTagToPath(`/write/${bookId}/publish${$page.url.search}`, $page.url);
			if (event.shiftKey || event.ctrlKey) {
				window.open(url, '_blank', 'noreferrer');
			} else {
				goto(url);
			}
		}
	}

	async function save() {
		return await fetch('/api/book/draft', {
			method: bookId ? 'PUT' : 'POST',
			body: JSON.stringify({
				bookId,
				nativeLanguage,
				title,
				subtitle,
				freeArea,
				paidArea,
				salesArea
			})
		})
			.then(async (res) => {
				const result = (await res.json()) as BookDraftUpdateResult;
				bookStatus = 0;
				initTitle = title;
				lastUpdatedAt = new Date();
				isAutoSaved = true;
				window.setTimeout(() => {
					isAutoSaved = false;
				}, 2000);
				if (bookId !== result.bookId) {
					const replaceUrl = setLanguageTagToPath(`/write/${result.bookId}`, $page.url);
					replaceState(replaceUrl, {});
				}
				bookId = result.bookId;
				return result;
			})
			.catch((e: Error) => e);
	}
</script>

<svelte:head>
	{#if bookId && initTitle}
		<title>Edit "{initTitle}" | ShortBook</title>
	{:else if bookId}
		<title>Edit [No title] | ShortBook</title>
	{:else}
		<title>Write new book | ShortBook</title>
	{/if}
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<HeaderArea>
	<a
		href={callbackUrl || '/write'}
		class="block shrink-0 p-2.5 hover:bg-stone-200 focus:bg-stone-200"
		title="Back to my articles list"
	>
		<IconArrowLeft width="24" height="24" class="rtl:rotate-180" />
	</a>
	<div class="min-w-24 px-2 leading-tight">
		<p class="text-stone-700">
			{#if bookStatus === 1}
				Published
			{:else if hasPublishedRevision}
				Rewriting
			{:else}
				Draft
			{/if}
		</p>
		<p class="text-stone-500" title={savedLabel}>
			{isAutoSaved ? 'Saved' : 'Auto save'}
		</p>
	</div>
	<div class="relative mx-1">
		<button
			type="button"
			disabled={unpublishableReasons.length > 0}
			class="peer rounded-md bg-primary-200 px-2 py-1 text-lg disabled:bg-stone-200 disabled:text-stone-500 hover:[&:not(:disabled)]:bg-primary-700 hover:[&:not(:disabled)]:text-white focus:[&:not(:disabled)]:bg-primary-700 focus:[&:not(:disabled)]:text-white"
			onclick={finish}>{bookStatus === 1 ? 'Republish' : 'Publish'}</button
		>
		<div
			class="absolute -left-16 top-12 hidden min-w-56 flex-col gap-3 rounded-lg border border-stone-300 bg-white px-4 py-3 text-lg text-red-700 peer-[:hover:disabled]:flex xs:-left-2.5"
		>
			{#each unpublishableReasons as reason}
				<p>{reason}</p>
			{/each}
		</div>
	</div>
</HeaderArea>

<div class="flex flex-col items-center px-4 pb-24 pt-16">
	<div class="flex min-h-dvh w-full max-w-[640px] flex-1 flex-col">
		<TextAreaSingle
			bind:value={title}
			name="title"
			required={true}
			maxlength={data.form.constraints?.title?.maxlength}
			placeholder="Title"
			className="mb-4"
			inputClass="text-[2.25rem] leading-tight font-semibold xs:text-[3.25rem]"
			onInput={autoSave}
		/>
		<TextAreaSingle
			bind:value={subtitle}
			name="subtitle"
			maxlength={data.form.constraints?.subtitle?.maxlength}
			placeholder="Subtitle"
			className="mb-8"
			inputClass="text-[1.5rem] text-stone-500"
			onInput={autoSave}
		/>
		<hr class="mb-8 border-stone-300" />
		<Editor
			bind:value={freeArea}
			bind:hasContent={hasFreeArea}
			namespace="book-free-area"
			placeholder="Free area... Write your knowledge..."
			onInput={autoSave}
		/>
		<p class="mt-8 text-center text-lg text-stone-500">Free area end</p>
		<hr class="my-2 border-t-4 border-double border-stone-300" />
		<p class="mb-8 text-center text-lg text-stone-500">Paid area start</p>
		<Editor
			bind:value={paidArea}
			bind:hasContent={hasPaidArea}
			namespace="book-paid-area"
			placeholder="Paid area... Write special contents..."
			onInput={autoSave}
		/>
		<p class="mt-8 text-center text-lg text-stone-500">Paid area end</p>
		<hr class="my-2 border-t-4 border-double border-stone-300" />
		<p class="mb-8 text-center text-lg text-stone-500">Bonus: Write a sales pitch</p>
		<SalesMessage imageSrc={$page.data.signInUser.imageSrc}>
			<Editor
				bind:value={salesArea}
				bind:hasContent={hasSalesArea}
				namespace="book-sales-area"
				placeholder="Appeal &quot;Buy and read this!&quot;..."
				onInput={autoSave}
			/>
			{#if !hasPaidArea && hasSalesArea}
				<MessageWarning
					message="If you do not write the paid area, this area will not be displayed to users."
					className="mt-4"
				/>
			{:else}
				<div class="mt-4 inline-block rounded-lg bg-primary-200 px-4 py-3 text-2xl">
					Buy for $◯.◯◯
				</div>
			{/if}
		</SalesMessage>
	</div>
</div>
