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
		src="{imageSrc}?ext=jpg&w=24&h=24&q=80"
		alt="{name} profile icon"
		class="h-6 w-6 rounded bg-white"
	/>
	<p
		class="line-clamp-3 whitespace-pre-wrap break-words text-lg leading-snug xs:line-clamp-2 md:line-clamp-1"
	>
		{name}
	</p>
</svelte:element>
