<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		heading: string;
		content?: string;
	};
	let { children, heading, content = '' }: Props = $props();
</script>

<section class="mx-auto mb-16 max-w-2xl px-4 text-xl sm:px-8">
	<h2 class="mb-4 border-s-8 border-primary-700 ps-4 text-4xl font-bold">{heading}</h2>
	{#if content}
		<p class="mb-4 ps-6">{content}</p>
	{/if}
	{#if children}
		<div class="mb-4 ps-6">
			{@render children()}
		</div>
	{/if}
</section>
