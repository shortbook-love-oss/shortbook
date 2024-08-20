<script lang="ts">
	import type { BookItem } from '$lib/utilities/book';
	import type { AvailableLanguageTags } from '$lib/utilities/language';
	import BookCover from '$lib/components/service/read/book-cover.svelte';
	import ProfileCardSmall from '../mypage/profile-card-small.svelte';

	export let book: BookItem;
	export let penName: string;
	export let requestLang: AvailableLanguageTags;
	export let className = '';

	$: bookUrl = `/@${book.userKeyName}/book/${book.bookKeyName}`;
</script>

<article class="flex items-start gap-4 {className}">
	<a href={bookUrl} class="peer flex w-24 shrink-0 justify-center overflow-hidden max-sm:hidden">
		<BookCover {book} {penName} width={96} />
	</a>
	<div class="-mt-1 w-full min-w-0 flex-1 peer-hover:[&>a]:underline">
		<a
			href={bookUrl}
			class="mb-1 block break-words font-serif text-4xl font-semibold leading-tight hover:underline xs:text-5xl"
		>
			<h2 class="line-clamp-4 whitespace-pre-wrap">{book.title}</h2>
		</a>
		{#if book.subtitle}
			<a
				href={bookUrl}
				class="mb-2 line-clamp-3 block whitespace-pre-wrap break-words font-serif text-lg hover:underline"
				>{book.subtitle}</a
			>
		{/if}
		<div class="flex items-center gap-6">
			<ProfileCardSmall
				name={book.penName}
				keyName={book.userKeyName}
				imageSrc={book.userImage}
				className="min-w-0"
			/>
			<p class="break-keep">{book.publishedAt.toLocaleDateString(requestLang)}</p>
		</div>
	</div>
</article>
