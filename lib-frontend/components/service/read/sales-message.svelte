<script lang="ts">
	export let image: string;
	export let message: string;
</script>

<div class="items-start gap-4 xs:flex">
	<div class="shrink-0 max-xs:mb-4">
		<img
			src="{image}?w=128&h=128&fit=cover"
			width="128"
			height="128"
			class="rounded-lg"
			alt="Profile icon"
		/>
	</div>
	<div
		class="relative min-w-0 rounded-lg border border-stone-400 before:absolute before:h-5 before:w-5 before:rotate-45 before:border before:border-stone-400 before:bg-white max-xs:before:-top-2.5 max-xs:before:start-8 xs:before:-start-2.5 xs:before:top-8"
	>
		<div class="z-1 relative rounded-[0.4375rem] bg-white p-4">
			{#if message}
				<div class="article_content mb-4 text-lg">
					{@html message}
				</div>
			{/if}
			<slot name="action" />
		</div>
	</div>
</div>
