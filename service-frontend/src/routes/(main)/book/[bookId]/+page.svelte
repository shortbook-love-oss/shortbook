<script lang="ts">
	import IconWrite from '~icons/mdi/pencil-plus';
	import { page } from '$app/stores';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let data;

	const publishedAt = data.bookDetail.publishedAt.toLocaleDateString(data.requestLang);
</script>

<svelte:head>
	<title>{data.bookDetail.title} | {data.bookDetail.penName}</title>
</svelte:head>

<article class="flex flex-col items-center justify-center gap-16 lg:flex-row lg:items-stretch">
	<div
		class="hidden w-full max-w-xl shrink-0 gap-8 break-words lg:flex lg:w-48 lg:justify-end"
	>
		<div class="max-w-full">
			<img
				src="{data.bookDetail.image}?w=64&h=64&fit=cover"
				alt="{data.bookDetail.penName} profile icon"
				class="mb-4 h-16 w-16 rounded bg-white"
			/>
			<p class="mb-4 whitespace-pre-wrap text-xl leading-snug">
				{data.bookDetail.penName}
			</p>
			<p class="whitespace-pre-wrap">
				{data.profileLang?.headline}
			</p>
		</div>
	</div>
	<div class="w-full max-w-xl overflow-x-hidden break-words">
		<h1 class="mb-4 whitespace-pre-wrap text-3xl font-semibold leading-tight sm:text-4xl">
			{data.bookDetail.title}
		</h1>
		{#if data.bookDetail.subtitle}
			<p class="mb-4 whitespace-pre-wrap text-xl leading-normal">{data.bookDetail.subtitle}</p>
		{/if}
		<div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 lg:hidden">
			<ProfileCard name={data.bookDetail.penName} imageSrc={data.bookDetail.image}>
				{#if data.profileLang?.headline}
					<p class="mt-1">{data.profileLang.headline}</p>
				{/if}
			</ProfileCard>
		</div>
		<div class="mb-8 flex items-center gap-4 border-b border-stone-300 pb-8">
			<time datetime={data.bookDetail.publishedAt.toISOString()}>{publishedAt}</time>
			{#if data.bookDetail.userId === $page.data.session?.user?.id}
				<NavLinkSmall name="Edit" href="/write/{data.bookDetail.id}" className="w-fit">
					<IconWrite width="20" height="20" className="-me-1" />
				</NavLinkSmall>
			{/if}
		</div>
		{#if data.bookDetail.prologue}
			<section class="article_content mb-8 border-b border-stone-300 pb-8 text-lg">
				{@html data.bookDetail.prologue}
			</section>
		{/if}
		<section class="article_content text-lg">
			{@html data.bookDetail.content}
		</section>
	</div>
	<div class="hidden shrink-0 lg:block lg:w-48">
		<BookCover
			book={data.bookDetail}
			penName={data.bookDetail.penName}
			width={160}
			className="mb-4"
		/>
	</div>
</article>
