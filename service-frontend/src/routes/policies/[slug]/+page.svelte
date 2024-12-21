<script lang="ts">
	import BookRead from '$lib/components/layouts/book-read.svelte';
	import Ogp from '$lib/components/service/ogp.svelte';
	import '$src/styles/book/content.scss';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.bookDetail.title}</title>
	<Ogp pageType="website" title={data.bookDetail.title} />
</svelte:head>

<BookRead>
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
	<hr class="my-8 border-stone-300" />
	<section class="sb_bc__root mb-8">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.bookDetail.freeArea}
	</section>
</BookRead>
