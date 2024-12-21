<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		bookCover?: Snippet;
		children: Snippet;
		aside?: Snippet;
	};
	let { bookCover, children, aside }: Props = $props();
</script>

<article class="flex flex-col items-center justify-center gap-16 xl:flex-row xl:items-stretch">
	<div class="hidden shrink-0 pt-1.5 xl:block xl:w-56">
		{@render bookCover?.()}
	</div>
	<div class="w-full min-w-0 max-w-[640px] break-words">
		{@render children()}
	</div>
	<div class="hidden shrink-0 xl:block xl:w-56" aria-hidden="true">
		{@render aside?.()}
	</div>
</article>
