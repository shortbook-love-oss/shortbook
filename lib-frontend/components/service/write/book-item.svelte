<script lang="ts">
	import type { BookItem } from '$lib/utilities/book';
	import type { AvailableLanguageTags } from '$lib/utilities/language';

	export let book: BookItem;
	export let requestLang: AvailableLanguageTags;

	let colorStart = '';
	let colorEnd = '';
	const colorKey = parseInt(book.id.slice(-1), 36);
	if (colorKey < 12) {
		colorStart = 'primary-800';
		colorEnd = 'primary-500';
	} else if (colorKey < 24) {
		colorStart = 'slate-800';
		colorEnd = 'slate-500';
	} else {
		colorStart = 'cyan-900';
		colorEnd = 'cyan-600';
	}
</script>

<article>
	<a
		href="/write/{book.id}"
		class="flex items-start gap-x-4 px-4 py-6 hover:bg-stone-200 focus:bg-stone-200 sm:gap-6"
	>
		<div
			class="h-20 w-20 shrink-0 bg-gradient-to-br from-{colorStart} to-{colorEnd} overflow-hidden py-2 pe-2 ps-4"
		>
			<p class="whitespace-pre-wrap break-words text-xs font-semibold text-white">
				{book.title}
			</p>
		</div>
		<div class="flex-1 overflow-x-hidden">
			<h2
				class="-mt-1.5 mb-2 line-clamp-3 whitespace-pre-wrap break-words text-2xl font-semibold lg:line-clamp-4"
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
