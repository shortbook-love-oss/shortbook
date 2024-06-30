<script lang="ts">
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import ProfileCardSmall from '$lib/components/service/mypage/profile-card-small.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';

	export let data;

	const publishedAt = data.bookDetail.publishedAt.toLocaleDateString(data.requestLang);
</script>

<article class="flex flex-col items-center justify-center gap-16 lg:flex-row lg:items-stretch">
	<div class="hidden shrink-0 justify-end lg:flex">
		<BookCover book={data.bookDetail} />
	</div>
	<div class="w-full max-w-xl overflow-x-hidden break-words">
		<h1 class="whitespace-pre-wrap text-3xl font-semibold leading-tight sm:text-4xl">
			{data.bookDetail.title}
		</h1>
		{#if data.bookDetail.subtitle}
			<p class="mt-4 whitespace-pre-wrap text-xl leading-normal">{data.bookDetail.subtitle}</p>
		{/if}
		<div class="mt-8 flex flex-wrap gap-x-8 gap-y-2">
			<ProfileCard name={data.bookDetail.penName} imageSrc={data.bookDetail.image}>
				<p class="mt-1">{publishedAt}</p>
			</ProfileCard>
		</div>
		{#if data.bookDetail.prologue}
			<p class="mt-8 whitespace-pre-wrap border-t border-stone-300 pt-8 text-lg">
				{data.bookDetail.prologue}
			</p>
		{/if}
		<p class="mt-8 border-t border-stone-300 pt-8 text-lg">{data.bookDetail.content}</p>
	</div>
	<div class="hidden w-full max-w-xl shrink-0 gap-8 lg:block lg:w-60">
		<ProfileCardSmall
			name={data.bookDetail.penName}
			imageSrc={data.bookDetail.image}
			imageSizeClass="h-12 w-12"
		/>
		<p class="mt-4">Published : {publishedAt}</p>
	</div>
</article>
