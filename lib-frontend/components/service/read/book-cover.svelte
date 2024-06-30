<script lang="ts">
	import type { MyBookItem } from '$lib/utilities/book';

	export let book: MyBookItem;
	export let sizeClass = 'h-[8.4rem] w-24 py-3 pe-3 ps-6 lg:h-56 lg:w-40 lg:text-lg';
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

<div
	class="shrink-0 rounded-md bg-gradient-to-br from-{colorStart} to-{colorEnd} overflow-hidden {sizeClass} {className}"
>
	<p class="whitespace-pre-wrap break-words font-semibold text-white">
		{book.title}
	</p>
</div>
