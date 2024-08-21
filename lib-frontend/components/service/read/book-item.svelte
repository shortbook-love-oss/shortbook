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
	<div
		class="-mt-1 w-full min-w-0 flex-1 peer-hover:[&>h2>a]:underline peer-hover:[&>p>a]:underline"
	>
		<h2>
			<a
				href={bookUrl}
				class="font-title line-clamp-4 whitespace-pre-wrap break-words pb-[0.125em] text-4xl font-semibold leading-tight hover:underline xs:text-5xl"
			>
				{book.title}
			</a>
		</h2>
		{#if book.subtitle}
			<p class="mb-1.5">
				<a
					href={bookUrl}
					class="font-title line-clamp-3 whitespace-pre-wrap break-words pb-[0.125em] text-lg hover:underline"
					>{book.subtitle}</a
				>
			</p>
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
