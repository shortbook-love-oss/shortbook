<script lang="ts">
	type Props = {
		name: string;
		keyHandle?: string;
		imageSrc?: string;
		className?: string;
	};
	let { name, keyHandle = '', imageSrc = '', className = '' }: Props = $props();
</script>

<svelte:element
	this={keyHandle ? 'a' : 'p'}
	href={keyHandle ? `/@${keyHandle}` : undefined}
	class="flex items-center gap-2 {keyHandle ? 'hover:underline' : ''} {className}"
>
	<picture class="shrink-0">
		<source srcset="{imageSrc}?ext=avif&w=24&h=24&q=80" type="image/avif" />
		<img
			src="{imageSrc}?ext=png&w=24&h=24&q=80"
			alt="{name} profile icon"
			class="h-6 w-6 rounded bg-white"
		/>
	</picture>
	<p
		class="line-clamp-3 whitespace-pre-wrap break-words text-lg leading-snug xs:line-clamp-2 md:line-clamp-1"
	>
		{name}
	</p>
</svelte:element>
