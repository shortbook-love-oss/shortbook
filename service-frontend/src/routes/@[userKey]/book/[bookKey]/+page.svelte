<script lang="ts">
	import IconArrowRight from '~icons/mdi/arrow-right';
	import IconCheck from '~icons/mdi/check';
	import IconWrite from '~icons/mdi/pencil-plus';
	import { page } from '$app/stores';
	import { toLocaleDate } from '$lib/utilities/date';
	import {
		getLanguageItem,
		type AvailableLanguageTags,
		type LanguageSelect
	} from '$lib/utilities/language';
	import {
		redirectParam,
		getLanguageTagFromUrl,
		inquiryCategoryParam,
		removeLanguageTagFromPath
	} from '$lib/utilities/url';
	import BookRead from '$lib/components/layouts/book-read.svelte';
	import MessageWarning from '$lib/components/modules/information/message-warning.svelte';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';
	import PaymentAction from '$lib/components/service/read/payment-action.svelte';
	import SalesMessage from '$lib/components/service/read/sales-message.svelte';
	import Ogp from '$lib/components/service/ogp.svelte';
	import '$src/styles/book/content.scss';

	let { data } = $props();

	const requestLang = getLanguageTagFromUrl($page.url);
	const isShowPaidArea = data.isBoughtBook || data.bookDetail.buyPoint === 0 || data.isOwn;
	const isSignedAsAdmin = $page.data.signInUser?.isAdmin ?? false;
	const updatedAt = toLocaleDate(data.bookDetail.updatedAt, requestLang);
	const requestLangItem = getLanguageItem(requestLang);
	const bookNativeLangItem = getLanguageItem(data.bookNativeLang);

	const editUrl = $derived.by(() => {
		const searchParams = new URLSearchParams({ [redirectParam]: $page.url.pathname });
		return `/write/${data.bookDetail.id}?${searchParams.toString()}`;
	});
</script>

{#snippet switchLanguage(language: LanguageSelect<AvailableLanguageTags>)}
	<a
		href={removeLanguageTagFromPath($page.url.pathname + $page.url.search)}
		hreflang={language.value}
		class="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-3 py-2 hover:bg-stone-100 focus:bg-stone-100"
	>
		<span>Switch to {language.english} version</span>
		<IconArrowRight width="24" height="24" class="shrink-0" />
	</a>
{/snippet}

<svelte:head>
	<title>{data.bookDetail.title} | {data.bookDetail.penName}</title>
	<Ogp pageType="profile" title="{data.bookDetail.penName} — {data.bookDetail.title}" />
	{#if data.bookDetail.isAdminBook}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<BookRead>
	{#snippet bookCover()}
		<BookCover
			book={data.bookDetail}
			penName={data.bookDetail.penName}
			width={216}
			className="mb-4"
		/>
	{/snippet}

	<h1
		class="whitespace-pre-wrap text-[2.25rem] font-semibold leading-tight xs:text-[3.25rem] {data
			.bookDetail.subtitle
			? 'mb-2'
			: 'mb-6'}"
	>
		{data.bookDetail.title}
	</h1>
	{#if data.bookDetail.subtitle}
		<p class="mb-8 whitespace-pre-wrap text-[1.5rem] text-stone-500">
			{data.bookDetail.subtitle}
		</p>
	{/if}
	<div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
		<ProfileCard
			name={data.bookDetail.penName}
			keyHandle={data.bookDetail.userKeyHandle}
			imageSrc={data.bookDetail.userImage}
		>
			{#if data.userLang?.headline}
				<p class="mt-1">{data.userLang.headline}</p>
			{/if}
		</ProfileCard>
	</div>
	<div class="mb-8 flex flex-wrap items-center gap-4">
		<time datetime={data.bookDetail.updatedAt.toISOString()} class="text-stone-600"
			>{updatedAt}</time
		>
		{#if !data.isFallbackBookLang && bookNativeLangItem != undefined && bookNativeLangItem.value !== requestLang}
			<a
				href={removeLanguageTagFromPath($page.url.pathname + $page.url.search)}
				hreflang={bookNativeLangItem.value}
				class="underline">Original : {bookNativeLangItem.english}</a
			>
		{/if}
		{#if data.isOwn && !data.bookDetail.isBookDeleted}
			<NavLinkSmall name="Edit" href={editUrl} className="-my-2 w-fit">
				<IconWrite width="20" height="20" className="-me-1" />
			</NavLinkSmall>
		{/if}
		{#if data.isBoughtBook}
			<NavLinkSmall name="Bought" colorClass="bg-green-200" className="-my-2 w-fit">
				<IconCheck width="20" height="20" class="-mx-1" />
			</NavLinkSmall>
		{/if}
	</div>
	{#if data.bookDetail.isBookDeleted}
		<MessageWarning className="mb-6">
			<p>This book has been deleted.</p>
			{#if data.isOwn}
				<p>Bought users can still read this book.</p>
				<p>
					If you accidentally deleted it, <a
						href="{$page.url.origin}/support/contact?{inquiryCategoryParam}=other"
						class="underline">please contact support.</a
					>
				</p>
			{:else if data.isBoughtBook}
				<p>You bought it so you can read it.</p>
			{/if}
		</MessageWarning>
	{/if}
	{#if data.isFallbackBookLang && requestLangItem && bookNativeLangItem != undefined}
		<MessageWarning className="mb-6">
			<p class="mb-1">
				This book is written in {bookNativeLangItem.english} and has not been translated into
				{requestLangItem.english}.
			</p>
			{@render switchLanguage(bookNativeLangItem)}
		</MessageWarning>
	{/if}
	<hr class="my-8 border-stone-300" />
	{#if data.bookDetail.freeArea}
		<section class="sb_bc__root mb-8">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html data.bookDetail.freeArea}
		</section>
	{/if}
	{#if data.hasPaidArea}
		{#if !isShowPaidArea || isSignedAsAdmin}
			<SalesMessage imageSrc={data.bookDetail.userImage}>
				<section class="sb_bc__root mb-4">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html data.bookDetail.salesArea}
				</section>
				{#if isSignedAsAdmin}
					<div class="mb-2 inline-block rounded-lg bg-primary-200 px-4 py-3 text-2xl">
						Buy for {data.primaryCurrency?.text}
					</div>
					<p>(Admin mode)</p>
				{:else if data.hasEnoughPoint}
					<a
						href="/redirect/book/{data.bookDetail.id}/buy"
						class="mb-2 inline-block rounded-lg bg-primary-200 px-4 py-3 text-2xl hover:bg-primary-300 focus:bg-primary-300"
						data-sveltekit-reload>Buy for {data.bookDetail.buyPoint} point</a
					>
					<p>You have {data.userPoint} point.</p>
				{:else}
					<PaymentAction
						bookId={data.bookDetail.id}
						currencyList={data.currencyList}
						primaryCurrency={data.primaryCurrency}
					/>
				{/if}
			</SalesMessage>
		{/if}
		{#if isShowPaidArea || isSignedAsAdmin}
			<section class="sb_bc__root">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html data.bookDetail.paidArea}
			</section>
		{/if}
	{/if}
</BookRead>
