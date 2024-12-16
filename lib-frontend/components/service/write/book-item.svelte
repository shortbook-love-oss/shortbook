<script lang="ts">
	import IconMore from '~icons/mdi/more-horiz';
	import type { MyBookItem } from '$lib/utilities/book';
	import { toLocaleDatetime } from '$lib/utilities/date';
	import type { AvailableLanguageTags } from '$lib/utilities/language';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';

	type Props = {
		book: MyBookItem;
		penName: string;
		requestLang: AvailableLanguageTags;
	};
	let { book, penName, requestLang }: Props = $props();
</script>

<article class="relative flex">
	<a
		href="/write/{book.id}"
		class="flex flex-1 items-center gap-x-4 p-4 hover:bg-stone-200 focus:bg-stone-200 sm:gap-6"
	>
		<div class="hidden xs:contents">
			<BookCover {book} {penName} width={64} />
		</div>
		<div class="-mt-1.5 flex-1 py-2">
			<h2
				class="mb-1 line-clamp-3 whitespace-pre-wrap break-words pb-[0.1em] text-3xl font-semibold [word-break:break-word] lg:line-clamp-4"
			>
				{#if book.title}
					{book.title}
				{:else}
					<span class="text-stone-500">[No title]</span>
				{/if}
			</h2>
			<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
				<p>Last updated {toLocaleDatetime(book.updatedAt, requestLang)}</p>
				{#if book.status === 0}
					<p
						class="font-semibold before:mb-1 before:me-1 before:inline-block before:h-4 before:w-4 before:rounded-full before:bg-red-500 before:align-middle"
					>
						{book.hasPublishedRevision ? 'Rewriting' : 'Draft'}
					</p>
				{:else if book.status === 1}
					<p>Published</p>
				{/if}
				{#if book.isAdmin}
					<p class="rounded-md border-2 border-primary-700 px-2">Admin</p>
				{/if}
			</div>
		</div>
	</a>
	<Dropdown
		name="book_item_control_{book.id}"
		openerClass="shrink-0"
		dropdownClass="right-0 bottom-0"
	>
		{#snippet opener()}
			<div class="flex items-center p-2">
				<IconMore width="36" height="36" />
			</div>
		{/snippet}
		{#if book.hasPublishedRevision}
			<NavLinkSmall name="Go to published page" href="/book/{book.id}" />
		{/if}
		<form method="POST" action="/write/{book.id}?/delete">
			<Dialog
				name="book_item_control_{book.id}"
				openerClass="rounded-lg"
				dialogSizeClass="max-w-md"
			>
				{#snippet opener()}
					<p class="px-3 py-2 text-lg text-red-800">Delete a book</p>
				{/snippet}
				<p>Are you sure you want to delete this book?</p>
				<p class="mb-2">It cannot be restored.</p>
				<button
					class="mx-auto block rounded-lg px-3 py-2 text-red-800 hover:bg-stone-200 focus:bg-stone-200"
					>Delete</button
				>
			</Dialog>
		</form>
	</Dropdown>
</article>
