<script lang="ts">
	import IconPlus from '~icons/mdi/plus';
	import BookItem from '$lib/components/service/read/book-item.svelte';

	export let data;
</script>

<svelte:head>
	<title>ShortBook — Writing platform</title>
</svelte:head>

<div class="mb-8 flex flex-wrap items-center gap-4">
	{#if data.bookList.length}
		<h1 class="text-2xl font-semibold">Explore books</h1>
	{/if}
	<a
		href="/write/new"
		class="flex items-center gap-2 rounded-lg border-2 border-primary-700 bg-primary-100 px-3 py-2 text-lg font-semibold text-primary-950 hover:bg-primary-200"
	>
		<IconPlus width="24" height="24" class="-mx-1 shrink-0" />
		<p>Write new book</p>
	</a>
</div>
{#if data.bookList.length}
	<ul class="-mx-4 grid grid-cols-1 sm:-mx-8 md:grid-cols-2 md:gap-y-4 2xl:grid-cols-3">
		{#each data.bookList as book (book.id)}
			<li>
				<BookItem {book} requestLang={data.requestLang} className="h-full" />
			</li>
		{/each}
	</ul>
{:else}
	<p>Not written yet. <a href="/write/new" class="underline">Let's write it now</a></p>
{/if}
