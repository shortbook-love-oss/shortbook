<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		name?: string;
		href?: string;
		target?: string;
		colorClass?: string;
		className?: string;
	};
	let {
		children,
		name = '',
		href = '',
		target,
		colorClass = 'hover:bg-stone-200 focus:bg-stone-200',
		className = ''
	}: Props = $props();
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	href={href ? href : undefined}
	target={href && target ? target : undefined}
	class="flex items-center gap-2 rounded-lg px-3 py-2 text-lg {colorClass} {className}"
>
	{#if children}
		<div class="shrink-0">
			{@render children()}
		</div>
	{/if}
	<p>{name}</p>
</svelte:element>
