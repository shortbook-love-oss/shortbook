<script lang="ts">
	import IconPlus from '~icons/mdi/plus';
	import BookItem from '$lib/components/service/write/book-item.svelte';

	export let data;
</script>

<svelte:head>
	<title>My books | ShortBook</title>
</svelte:head>

<div class="mb-8 flex flex-wrap items-center gap-4">
	<h1 class="text-2xl font-semibold">My books</h1>
	<a
		href="/write/new"
		class="flex items-center gap-2 rounded-lg border-2 border-primary-700 bg-primary-100 px-3 py-2 text-lg font-semibold text-primary-950 hover:bg-primary-200"
	>
		<IconPlus width="24" height="24" class="-mx-1 shrink-0" />
		<p>Write new book</p>
	</a>
</div>
{#if data.bookList.length}
	<ul class="flex flex-col">
		{#each data.bookList as book (book.id)}
			<li class="-mx-4">
				<BookItem {book} requestLang={data.requestLang} />
			</li>
		{/each}
	</ul>
{/if}
