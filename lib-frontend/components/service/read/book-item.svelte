<script lang="ts">
	import type { BookItem } from '$lib/utilities/book';
	import type { AvailableLanguageTags } from '$lib/utilities/language';
	import BookCover from '$lib/components/service/read/book-cover.svelte';
	import ProfileCardSmall from '../mypage/profile-card-small.svelte';

	export let book: BookItem;
	export let penName: string;
	export let requestLang: AvailableLanguageTags;
	export let className = '';
</script>

<article class={className}>
	<a
		href="/book/{book.id}"
		class="flex h-full items-start gap-x-4 px-4 py-6 hover:bg-stone-200 focus:bg-stone-200 sm:gap-6 sm:px-8"
	>
		<BookCover {book} {penName} width={160} />
		<div class="flex-1 overflow-x-hidden break-words">
			<h2
				class="-mt-1.5 line-clamp-3 whitespace-pre-wrap text-2xl font-semibold sm:line-clamp-2 md:line-clamp-3 xl:line-clamp-2 2xl:line-clamp-3"
			>
				{book.title}
			</h2>
			{#if book.subtitle}
				<p class="mt-2 line-clamp-2 whitespace-pre-wrap lg:line-clamp-3">{book.subtitle}</p>
			{/if}
			<ProfileCardSmall name={book.penName} imageSrc={book.image} className="mt-2" />
			<p class="mt-2">{book.publishedAt.toLocaleDateString(requestLang)}</p>
		</div>
	</a>
</article>
