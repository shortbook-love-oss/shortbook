<script lang="ts">
	import type { MyBookItem } from '$lib/utilities/book';
	import type { AvailableLanguageTags } from '$lib/utilities/language';
	import BookCover from '$lib/components/service/read/book-cover.svelte';

	export let book: MyBookItem;
	export let penName: string;
	export let requestLang: AvailableLanguageTags;
</script>

<article>
	<a
		href="/write/{book.id}"
		class="flex items-center gap-x-4 px-4 py-6 hover:bg-stone-200 focus:bg-stone-200 sm:gap-6"
	>
		<BookCover {book} {penName} width={64} />
		<div class="flex-1 overflow-x-hidden">
			<h2
				class="-mt-1.5 mb-1 line-clamp-3 whitespace-pre-wrap break-words pb-[0.125em] text-2xl font-semibold lg:line-clamp-4"
			>
				{book.title}
			</h2>
			<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
				<p>Last updated {book.updatedAt.toLocaleString(requestLang)}</p>
				{#if book.status === 0}
					<p
						class="font-semibold before:mb-1 before:me-1 before:inline-block before:h-4 before:w-4 before:rounded-full before:bg-red-500 before:align-middle"
					>
						Draft
					</p>
				{:else if book.status === 1}
					<p>Published</p>
				{/if}
			</div>
		</div>
	</a>
</article>
