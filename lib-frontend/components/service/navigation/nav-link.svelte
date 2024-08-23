<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		name?: string;
		href?: string;
		className?: string;
	};
	let { children, name = '', href = '', className = '' }: Props = $props();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	href={href ? href : undefined}
	class="flex items-center gap-2 px-3 py-2 text-lg hover:bg-stone-200 focus:bg-stone-200 {className}"
>
	{#if children}
		<div class="shrink-0">
			{@render children()}
		</div>
	{/if}
	<p>{name}</p>
</svelte:element>
