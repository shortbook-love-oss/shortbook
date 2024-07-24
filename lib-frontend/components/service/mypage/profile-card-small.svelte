<script lang="ts">
	export let name: string;
	export let keyName = '';
	export let imageSrc = '';
	export let className = '';
	export let imageSizeClass = 'h-6 w-6';
</script>

<svelte:element
	this={keyName ? 'a' : 'p'}
	href={keyName ? `/@${keyName}` : undefined}
	class="flex items-center gap-2 {keyName ? 'hover:underline' : ''} {className}"
>
	<img
		src="{imageSrc}?w=32&h=32&fit=cover"
		alt="{name} profile icon"
		class="rounded bg-white {imageSizeClass}"
	/>
	<p class="overflow-x-hidden whitespace-pre-wrap break-words text-lg leading-snug">
		{name}
	</p>
</svelte:element>
