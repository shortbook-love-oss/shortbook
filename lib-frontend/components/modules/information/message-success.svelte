<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconCheck from '~icons/mdi/check';

	type Props = {
		className?: string;
	} & (
		| {
				children: Snippet;
				message?: never;
		  }
		| {
				children?: never;
				message: string;
		  }
	);
	let { children, message = '', className = '' }: Props = $props();
</script>

{#if children || message}
	<div
		class="flex items-center gap-2 rounded-lg border-2 border-emerald-600 bg-emerald-50 p-4 text-lg leading-snug text-emerald-950 {className}"
	>
		<IconCheck width="24" height="24" class="shrink-0" />
		{#if children}
			<div>{@render children()}</div>
		{:else}
			<p>{message}</p>
		{/if}
	</div>
{/if}
