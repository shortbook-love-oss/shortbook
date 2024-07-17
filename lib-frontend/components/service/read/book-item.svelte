<script lang="ts">
	import type { BookItem } from '$lib/utilities/book';
	import type { AvailableLanguageTags } from '$lib/utilities/language';
	import BookCover from '$lib/components/service/read/book-cover.svelte';
	import ProfileCardSmall from '../mypage/profile-card-small.svelte';

	export let book: BookItem;
	export let penName: string;
	export let requestLang: AvailableLanguageTags;
	export let className = '';

	let coverWidth = 256;
</script>

<article class="xs:flex-col flex items-start gap-x-4 gap-y-2 {className}">
	<a
		href="/book/{book.id}"
		bind:clientWidth={coverWidth}
		class="aspect-book-cover xs:w-full xs:w-full xs:mt-0 mx-auto mt-1.5 flex w-[16vw] shrink-0 justify-center overflow-hidden"
	>
		<BookCover {book} {penName} width={coverWidth} />
	</a>
	<div class="w-full flex-1 overflow-x-hidden">
		<h2 class="line-clamp-4 whitespace-pre-wrap break-words text-xl font-semibold">
			<a href="/book/{book.id}" class="hover:underline">{book.title}</a>
		</h2>
		{#if book.subtitle}
			<p class="xs:hidden mt-2 line-clamp-3 whitespace-pre-wrap break-words">{book.subtitle}</p>
		{/if}
		<ProfileCardSmall name={book.penName} imageSrc={book.image} className="mt-2" />
		<p class="mt-2">{book.publishedAt.toLocaleDateString(requestLang)}</p>
	</div>
</article>
