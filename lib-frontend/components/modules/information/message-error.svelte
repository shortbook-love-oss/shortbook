<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconError from '~icons/mdi/warning-circle';

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
		class="flex items-center gap-2 rounded-lg border-2 border-red-700 bg-red-100 p-4 text-lg leading-snug text-red-900 {className}"
	>
		<IconError width="24" height="24" class="shrink-0" />
		{#if children}
			<div>{@render children()}</div>
		{:else}
			<p>{message}</p>
		{/if}
	</div>
{/if}
