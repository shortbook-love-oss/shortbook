<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconWarning from '~icons/mdi/warning';

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
		class="flex items-center gap-2 rounded-lg border-2 border-amber-600 bg-amber-100 p-4 text-lg leading-snug text-amber-950 {className}"
	>
		<IconWarning width="24" height="24" class="shrink-0" />
		{#if children}
			<div>{@render children()}</div>
		{:else}
			<p>{message}</p>
		{/if}
	</div>
{/if}
