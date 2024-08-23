<script lang="ts">
	import { bookTextAlignSelect } from '$lib/utilities/book';
	import type { BookCover } from '$lib/utilities/book';
	import { getSelectedText } from '$lib/utilities/select';

	type Props = {
		book: BookCover;
		penName: string;
		width?: number;
		className?: string;
	};
	let { book, penName, width = 240, className = '' }: Props = $props();
</script>

<div
	class="aspect-book-cover shrink-0 overflow-hidden {className}"
	style="border-radius: {width / 36}px; height: {width *
		1.5}px; width: {width}px; background-image: linear-gradient({book.baseColorDirection}deg, {book.baseColorStart}, {book.baseColorEnd});"
>
	<!-- Original book cover ratio is 2:3 -->
	<div
		class="flex h-[1200px] w-[800px] origin-top-left flex-col gap-8 p-8 tracking-wide rtl:origin-top-right"
		style="scale: {width / 800};"
	>
		<div style="text-align: {getSelectedText(bookTextAlignSelect, book.titleAlign)};">
			<p
				class="whitespace-pre-wrap break-words rounded-md p-6 font-semibold leading-snug"
				style="color: {book.titleColor}; font-size: {book.titleFontSize}px; line-height: {book.titleFontSize +
					16}px;"
			>
				{book.title}
			</p>
		</div>
		<div
			class="flex-1"
			style="text-align: {getSelectedText(bookTextAlignSelect, book.subtitleAlign)};"
		>
			<p
				class="whitespace-pre-wrap break-words rounded-md p-6 leading-snug"
				style="color: {book.subtitleColor}; font-size: {book.subtitleFontSize}px; line-height: {book.subtitleFontSize +
					16}px;"
			>
				{book.subtitle}
			</p>
		</div>
		<div style="text-align: {getSelectedText(bookTextAlignSelect, book.writerAlign)};">
			<p
				class="whitespace-pre-wrap break-words rounded-md p-6 text-[3rem] leading-snug"
				style="color: {book.writerColor};"
			>
				{penName}
			</p>
		</div>
	</div>
</div>
