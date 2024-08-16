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
	let coverWidth = 256;
</script>

<article class="flex items-start gap-x-4 gap-y-3 xs:flex-col {className}">
	<a
		href={bookUrl}
		bind:clientWidth={coverWidth}
		class="peer mx-auto flex aspect-book-cover w-[16vw] shrink-0 justify-center overflow-hidden max-xs:mt-1 xs:mt-0 xs:w-full"
	>
		<BookCover {book} {penName} width={coverWidth} />
	</a>
	<div
		class="w-full flex-1 max-sm:-m-2 max-sm:overflow-x-hidden max-sm:p-2 peer-hover:[&>a]:underline"
	>
		<a href={bookUrl} class="block break-words text-xl font-semibold hover:underline">
			<h2 class="line-clamp-4 whitespace-pre-wrap">{book.title}</h2>
		</a>
		{#if book.subtitle}
			<a
				href={bookUrl}
				class="mt-1 line-clamp-3 block whitespace-pre-wrap break-words hover:underline xs:hidden"
				>{book.subtitle}</a
			>
		{/if}
		<div>
			<ProfileCardSmall
				name={book.penName}
				keyName={book.userKeyName}
				imageSrc={book.userImage}
				className="mt-2"
			/>
		</div>
		<p class="mt-2">{book.publishedAt.toLocaleDateString(requestLang)}</p>
	</div>
</article>
