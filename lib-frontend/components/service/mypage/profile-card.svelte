<script lang="ts">
	export let name: string;
	export let imageSrc = '';
	export let className = '';
</script>

<div class="flex items-center gap-3 overflow-x-hidden rounded-lg {className}">
	{#if imageSrc}
		<img src={imageSrc} class="h-16 w-16 rounded-md bg-white" alt="Profile icon" />
	{/if}
	<div class="flex flex-col overflow-x-hidden">
		<p class="whitespace-pre-wrap break-words text-xl leading-snug">{name}</p>
		<slot />
	</div>
</div>
