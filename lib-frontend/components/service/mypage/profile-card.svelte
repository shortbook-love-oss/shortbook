<script lang="ts">
	export let name: string;
	export let keyName = '';
	export let imageSrc = '';
	export let className = '';
</script>

<svelte:element
	this={keyName ? 'a' : 'p'}
	href={keyName ? `/@${keyName}` : undefined}
	class="flex w-full items-center gap-3 rounded-lg {keyName ? 'hover:underline' : ''} {className}"
>
	{#if imageSrc}
		<img
			src="{imageSrc}?w=64&h=64&fit=cover"
			class="h-16 w-16 rounded-md bg-white"
			alt="Profile icon"
		/>
	{/if}
	<div class="flex flex-col overflow-x-hidden">
		<p class="whitespace-pre-wrap break-words text-xl leading-snug">{name}</p>
		<slot />
	</div>
</svelte:element>
