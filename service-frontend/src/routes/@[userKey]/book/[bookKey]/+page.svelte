<script lang="ts">
	import IconCheck from '~icons/mdi/check';
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconWarning from '~icons/mdi/warning';
	import { page } from '$app/stores';
	import { inquiryCategoryParam } from '$lib/utilities/url';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';
	import PaymentAction from '$lib/components/service/read/payment-action.svelte';
	import SalesMessage from '$lib/components/service/read/sales-message.svelte';

	export let data;

	const publishedAt = data.bookDetail.publishedAt.toLocaleDateString(data.requestLang);
</script>

<svelte:head>
	<title>{data.bookDetail.title} | {data.bookDetail.penName}</title>
</svelte:head>

<article class="flex flex-col items-center justify-center gap-16 lg:flex-row lg:items-stretch">
	<div
		class="hidden w-full max-w-xl shrink-0 gap-8 break-words pt-2 lg:flex lg:w-48 lg:justify-end"
	>
		<div class="max-w-full">
			<a href="/@{data.bookDetail.userKeyName}" class="peer mb-2 inline-block">
				<img
					src="{data.bookDetail.userImage}?w=64&h=64&fit=cover"
					alt="{data.bookDetail.penName} profile icon"
					class="h-16 w-16 rounded bg-white align-middle"
				/>
			</a>
			<a
				href="/@{data.bookDetail.userKeyName}"
				class="mb-2 block whitespace-pre-wrap text-xl leading-snug hover:underline peer-hover:underline"
			>
				{data.bookDetail.penName}
			</a>
			{#if data.profileLang?.headline}
				<p class="whitespace-pre-wrap">{data.profileLang.headline}</p>
			{/if}
		</div>
	</div>
	<div class="w-full min-w-0 max-w-xl break-words">
		<div class="-mx-4 mb-8 px-4">
			<h1 class="mb-4 whitespace-pre-wrap text-3xl font-semibold leading-tight sm:text-4xl">
				{data.bookDetail.title}
			</h1>
			{#if data.bookDetail.subtitle}
				<p class="mb-4 whitespace-pre-wrap text-xl leading-normal">
					{data.bookDetail.subtitle}
				</p>
			{/if}
			<div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 lg:hidden">
				<ProfileCard
					name={data.bookDetail.penName}
					keyName={data.bookDetail.userKeyName}
					imageSrc={data.bookDetail.userImage}
				>
					{#if data.profileLang?.headline}
						<p class="mt-1">{data.profileLang.headline}</p>
					{/if}
				</ProfileCard>
			</div>
			<div class="flex items-center gap-4">
				<time datetime={data.bookDetail.publishedAt.toISOString()}>{publishedAt}</time>
				{#if data.isOwn && !data.bookDetail.isBookDeleted}
					<NavLinkSmall name="Edit" href="/write/{data.bookDetail.id}" className="w-fit">
						<IconWrite width="20" height="20" className="-me-1" />
					</NavLinkSmall>
				{/if}
				{#if data.isBoughtBook}
					<NavLinkSmall name="Bought" colorClass="bg-green-200" className="w-fit">
						<IconCheck width="20" height="20" class="-mx-1" />
					</NavLinkSmall>
				{/if}
			</div>
		</div>
		{#if data.bookDetail.isBookDeleted}
			<div
				class="mb-8 flex items-center gap-3 rounded-lg border-2 border-amber-600 bg-amber-100 p-4 text-amber-950"
			>
				<IconWarning width="24" height="24" class="shrink-0" />
				<div class="text-lg leading-snug">
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
				</div>
			</div>
		{/if}
		{#if data.bookDetail.prologue}
			<hr class="my-8 border-stone-300" />
			<section class="article_content mb-8 text-lg">
				{@html data.bookDetail.prologue}
			</section>
		{/if}
		{#if data.isBoughtBook || data.bookDetail.buyPoint === 0 || data.isOwn}
			<section class="article_content text-lg">
				{@html data.bookDetail.content}
			</section>
		{:else}
			<SalesMessage image={data.bookDetail.userImage} message={data.bookDetail.salesMessage}>
				<svelte:fragment slot="action">
					{#if data.hasEnoughPoint}
						<a
							href="/redirect/book/{data.bookDetail.id}/buy"
							class="mb-2 inline-block rounded-lg bg-primary-200 px-4 py-3 text-2xl hover:bg-primary-300 focus:bg-primary-300"
							data-sveltekit-reload>Buy for {data.bookDetail.buyPoint} point</a
						>
						<p>You have {data.userPoint} point.</p>
					{:else}
						<PaymentAction
							bookId={data.bookDetail.id}
							currencyList={data.currencyPreviews}
							primaryCurrency={data.primaryCurrency}
						/>
					{/if}
				</svelte:fragment>
			</SalesMessage>
		{/if}
	</div>
	<div class="hidden shrink-0 pt-1 lg:block lg:w-48">
		<BookCover
			book={data.bookDetail}
			penName={data.bookDetail.penName}
			width={160}
			className="mb-4"
		/>
	</div>
</article>
