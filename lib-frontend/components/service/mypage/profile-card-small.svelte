<script lang="ts">
	type Props = {
		name: string;
		keyName?: string;
		imageSrc?: string;
		className?: string;
	};
	let { name, keyName = '', imageSrc = '', className = '' }: Props = $props();
</script>

<svelte:element
	this={keyName ? 'a' : 'p'}
	href={keyName ? `/@${keyName}` : undefined}
	class="flex items-center gap-2 {keyName ? 'hover:underline' : ''} {className}"
>
	<img
		src="{imageSrc}?w=32&h=32&fit=cover"
		alt="{name} profile icon"
		class="h-6 w-6 rounded bg-white"
	/>
	<p class="overflow-x-hidden whitespace-pre-wrap break-words text-lg leading-snug">
		{name}
	</p>
</svelte:element>
