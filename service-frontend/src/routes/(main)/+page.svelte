<script lang="ts">
	import IconPlus from '~icons/mdi/plus';
	import * as m from '$lib/i18n/paraglide/messages.js';
	import BookItem from '$lib/components/service/read/book-item.svelte';

	export let data;
</script>

<svelte:head>
	<title>ShortBook — Writing platform</title>
</svelte:head>

<div class="mx-auto max-w-[108rem]">
	<div class="mb-12 flex flex-wrap items-center gap-4">
		{#if data.bookList.length}
			<h1 class="text-2xl font-semibold">{m.top_heading()}</h1>
		{/if}
		<a
			href="/write/new"
			class="flex items-center gap-2 rounded-lg border-2 border-primary-700 bg-primary-100 px-3 py-2 text-lg font-semibold text-primary-950 hover:bg-primary-200"
		>
			<IconPlus width="24" height="24" class="-mx-1 shrink-0" />
			<p>{m.top_write_cta()}</p>
		</a>
	</div>
	{#if data.bookList.length}
		<ul
			class="xs:grid-cols-2 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
		>
			{#each data.bookList as book (book.id)}
				<li>
					<BookItem
						{book}
						penName={book.penName}
						requestLang={data.requestLang}
						className="w-full"
					/>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Not written yet. <a href="/write/new" class="underline">Let's write it now</a></p>
	{/if}
</div>
