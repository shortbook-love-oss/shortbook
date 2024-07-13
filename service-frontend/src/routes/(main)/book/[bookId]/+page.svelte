<script lang="ts">
	import IconWrite from '~icons/mdi/pencil-plus';
	import { page } from '$app/stores';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import ProfileCardSmall from '$lib/components/service/mypage/profile-card-small.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let data;

	const publishedAt = data.bookDetail.publishedAt.toLocaleDateString(data.requestLang);
</script>

<svelte:head>
	<title>{data.bookDetail.title} | {data.bookDetail.penName}</title>
</svelte:head>

<article class="flex flex-col items-center justify-center gap-16 lg:flex-row lg:items-stretch">
	<div class="hidden w-full max-w-xl shrink-0 gap-8 lg:block lg:w-60">
		<ProfileCardSmall
			name={data.bookDetail.penName}
			imageSrc={data.bookDetail.image}
			imageSizeClass="h-12 w-12"
		/>
		<p class="mt-4">Published : {publishedAt}</p>
		{#if data.bookDetail.userId === $page.data.session?.user?.id}
			<NavLinkSmall name="Edit" href="/write/{data.bookDetail.id}" className="-ms-1 mt-2 w-fit">
				<IconWrite width="20" height="20" />
			</NavLinkSmall>
		{/if}
	</div>
	<div class="w-full max-w-xl overflow-x-hidden break-words">
		<h1 class="whitespace-pre-wrap text-3xl font-semibold leading-tight sm:text-4xl">
			{data.bookDetail.title}
		</h1>
		{#if data.bookDetail.subtitle}
			<p class="mt-4 whitespace-pre-wrap text-xl leading-normal">{data.bookDetail.subtitle}</p>
		{/if}
		<div class="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 lg:hidden">
			<ProfileCard name={data.bookDetail.penName} imageSrc={data.bookDetail.image}>
				<p class="mt-1">{publishedAt}</p>
			</ProfileCard>
			{#if data.bookDetail.userId === $page.data.session?.user?.id}
				<NavLinkSmall name="Edit" href="/write/{data.bookDetail.id}" className="-ms-1 mt-2 w-fit">
					<IconWrite width="20" height="20" />
				</NavLinkSmall>
			{/if}
		</div>
		{#if data.bookDetail.prologue}
			<section class="article_content mt-8 border-t border-stone-300 pt-8 text-lg">
				{@html data.bookDetail.prologue}
			</section>
		{/if}
		<section class="article_content mt-8 border-t border-stone-300 pt-8 text-lg">
			{@html data.bookDetail.content}
		</section>
	</div>
	<div class="hidden shrink-0 lg:block lg:w-48 xl:w-60">
		<BookCover book={data.bookDetail} penName={data.bookDetail.penName} width={160} />
	</div>
</article>
