<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		className?: string;
	};
	let { children, className = '' }: Props = $props();
</script>

<header class="fixed start-0 top-0 z-10 flex items-center {className}">
	<nav
		class="flex items-center rounded-ee-lg border-b border-e border-stone-300 bg-white pl-[env(safe-area-inset-left,0px)] pt-[env(safe-area-inset-top,0px)] rtl:pr-[env(safe-area-inset-right,0px)]"
	>
		{@render children()}
	</nav>
</header>
