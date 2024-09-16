<script lang="ts">
	import type { BookItem } from '$lib/utilities/book';
	import { toLocaleDate } from '$lib/utilities/date';
	import type { AvailableLanguageTags } from '$lib/utilities/language';
	import ProfileCardSmall from '$lib/components/service/mypage/profile-card-small.svelte';
	import BookCover from '$lib/components/service/read/book-cover.svelte';

	type Props = {
		book: BookItem;
		penName: string;
		requestLang: AvailableLanguageTags;
		className?: string;
	};
	let { book, penName, requestLang, className = '' }: Props = $props();

	const bookUrl = $state(`/@${book.userKeyName}/book/${book.bookKeyName}`);
</script>

<article class="flex items-start gap-4 {className}">
	<a href={bookUrl} class="peer flex w-24 shrink-0 justify-center overflow-hidden max-sm:hidden">
		<BookCover {book} {penName} width={96} />
	</a>
	<div
		class="-mt-2 w-full min-w-0 flex-1 peer-hover:[&>h2>a]:underline peer-hover:[&>p>a]:underline"
	>
		<h2 class={book.subtitle ? '' : 'mb-2'}>
			<a
				href={bookUrl}
				class="line-clamp-4 whitespace-pre-wrap break-words pb-[0.1em] font-title text-[2.25rem] font-semibold leading-tight hover:underline xs:text-[3rem]"
			>
				{book.title}
			</a>
		</h2>
		{#if book.subtitle}
			<p class="mb-2">
				<a
					href={bookUrl}
					class="line-clamp-3 whitespace-pre-wrap break-words pb-[0.1em] text-xl text-stone-600 hover:underline"
					>{book.subtitle}</a
				>
			</p>
		{/if}
		<div class="flex items-center gap-5">
			<ProfileCardSmall
				name={book.penName}
				keyName={book.userKeyName}
				imageSrc={book.userImage}
				className="min-w-0"
			/>
			<time datetime={book.publishedAt.toISOString()} class="text-nowrap pb-0.5"
				>{toLocaleDate(book.publishedAt, requestLang)}</time
			>
		</div>
	</div>
</article>
