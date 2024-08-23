<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		name?: string;
		href?: string;
		className?: string;
	};
	let { children, name = '', href = '', className = '' }: Props = $props();
</script>

{#if href}
	<a
		{href}
		class="flex flex-col items-center px-3 pb-2 pt-1 text-stone-950 hover:bg-stone-200 focus:bg-stone-200 {className}"
	>
		{#if children}
			<div class="shrink-0">
				{@render children()}
			</div>
		{/if}
		<p class="text-nowrap leading-none">{name}</p>
	</a>
{:else}
	<!-- use inside focusable element -->
	<div class="flex flex-col items-center px-3 pb-2 pt-1 {className}">
		{#if children}
			<div class="shrink-0">
				{@render children()}
			</div>
		{/if}
		<p class="text-nowrap leading-none">{name}</p>
	</div>
{/if}
