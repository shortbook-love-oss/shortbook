<script lang="ts">
	import type { BookItem } from '$lib/utilities/book';
	import type { AvailableLanguageTags } from '$lib/utilities/language';

	export let book: BookItem;
	export let requestLang: AvailableLanguageTags;
	export let className = '';

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

<article class={className}>
	<a
		href="/book/{book.id}"
		class="flex h-full items-start gap-x-4 px-4 py-6 hover:bg-stone-200 focus:bg-stone-200 sm:gap-6 sm:px-8"
	>
		<div
			class="h-[8.4rem] w-24 shrink-0 rounded-md bg-gradient-to-br lg:h-56 lg:w-40 from-{colorStart} to-{colorEnd} overflow-hidden py-2 pe-2 ps-3"
		>
			<p class="whitespace-pre-wrap break-words font-semibold text-white lg:text-lg">
				{book.title}
			</p>
		</div>
		<div class="flex-1 overflow-x-hidden break-words">
			<h2
				class="-mt-1.5 line-clamp-3 whitespace-pre-wrap text-2xl font-semibold sm:line-clamp-2 md:line-clamp-3 xl:line-clamp-2 2xl:line-clamp-3"
			>
				{book.title}
			</h2>
			{#if book.subtitle}
				<p class="mt-1 line-clamp-2 whitespace-pre-wrap lg:line-clamp-3">{book.subtitle}</p>
			{/if}
			<div class="mt-1 flex gap-1">
				<img src={book.image} alt="{book.penName} profile icon" class="h-6 w-6" />
				<p>{book.penName}</p>
			</div>
			<p class="mt-1">{book.publishedAt.toLocaleDateString(requestLang)}</p>
		</div>
	</a>
</article>
