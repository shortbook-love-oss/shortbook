<script lang="ts">
	export let name: string;
	export let keyName = '';
	export let imageSrc = '';
	export let className = '';
</script>

<div class="flex w-full items-center gap-3 {className}">
	{#if imageSrc}
		<svelte:element
			this={keyName ? 'a' : 'div'}
			href={keyName ? `/@${keyName}` : undefined}
			class="peer shrink-0"
		>
			<img
				src="{imageSrc}?w=64&h=64&fit=cover"
				class="h-16 w-16 rounded-md bg-white"
				alt="Profile icon"
			/>
		</svelte:element>
	{/if}
	<div class="flex flex-col overflow-x-hidden break-words peer-hover:[&>a]:underline">
		<svelte:element
			this={keyName ? 'a' : 'p'}
			href={keyName ? `/@${keyName}` : undefined}
			class="whitespace-pre-wrap text-xl leading-snug {keyName ? 'hover:underline' : ''}"
			>{name}</svelte:element
		>
		<slot />
	</div>
</div>
