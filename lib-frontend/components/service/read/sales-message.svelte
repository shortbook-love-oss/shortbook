<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		action?: Snippet;
		image: string;
		message: string;
	};
	let { action, image, message }: Props = $props();
</script>

<div class="items-start gap-4 xs:flex">
	<div class="shrink-0 max-xs:mb-4">
		<img src="{image}?ext=jpg&w=128&h=128&q=100" alt="Profile icon" class="h-32 w-32 rounded-lg" />
	</div>
	<div
		class="relative min-w-0 flex-1 rounded-lg border border-stone-400 before:absolute before:h-5 before:w-5 before:rotate-45 before:border before:border-stone-400 before:bg-white max-xs:before:-top-2.5 max-xs:before:start-8 xs:before:-start-2.5 xs:before:top-8"
	>
		<div class="z-1 relative rounded-[0.4375rem] bg-white p-4">
			{#if message}
				<div class="article_content mb-4 font-serif text-xl">
					{@html message}
				</div>
			{/if}
			{#if action}
				{@render action()}
			{/if}
		</div>
	</div>
</div>
