<script lang="ts">
	import type { MyBookItem } from '$lib/utilities/book';

	export let book: MyBookItem;
	export let sizeClass = 'h-[8.4rem] w-24 p-2 lg:h-56 lg:w-40 lg:p-3 lg:text-lg';
	export let className = '';

	let colorStart = '';
	let colorEnd = '';
	const colorKey = parseInt(book.id.slice(-2, -1), 36);
	if (colorKey < 6) {
		colorStart = 'from-primary-800';
		colorEnd = 'to-primary-500';
	} else if (colorKey < 12) {
		colorStart = 'from-slate-900';
		colorEnd = 'to-slate-500';
	} else if (colorKey < 18) {
		colorStart = 'from-green-950';
		colorEnd = 'to-green-600';
	} else if (colorKey < 24) {
		colorStart = 'from-cyan-900';
		colorEnd = 'to-cyan-700';
	} else if (colorKey < 30) {
		colorStart = 'from-purple-950';
		colorEnd = 'to-purple-700';
	} else if (colorKey < 36) {
		colorStart = 'from-yellow-900';
		colorEnd = 'to-yellow-700';
	}
</script>

<div
	class="shrink-0 overflow-hidden rounded-md bg-gradient-to-br {colorStart} {colorEnd} {sizeClass} {className}"
>
	<p class="whitespace-pre-wrap break-words font-semibold text-white">
		{book.title}
	</p>
</div>
