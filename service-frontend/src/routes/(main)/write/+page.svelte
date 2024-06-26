<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Books | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Books you wrote</h1>
<a href="/write/new" class="mb-12 inline-block">Write new book</a>
{#if data.bookList.length}
	<ul>
		{#each data.bookList as book (book.id)}
			<li class="border border-primary-500 p-4">
				<p class="text-2xl">{book.title}</p>
				<p>{book.updatedAt.toLocaleString(data.requestLang)}</p>
				{#if book.status === 0}
					<p>Draft</p>
				{:else if book.status === 1}
					<p>Published at : {book.publishedAt.toLocaleString(data.requestLang)}</p>
				{/if}
				<a href="/write/{book.id}">Edit</a>
			</li>
		{/each}
	</ul>
{/if}
