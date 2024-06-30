<script lang="ts">
	export let name: string;
	export let imageSrc = '';
	export let className = '';
	export let imageSizeClass = 'h-6 w-6';
</script>

<div class="flex items-center gap-2 {className}">
	<img src={imageSrc} alt="{name} profile icon" class="rounded bg-white {imageSizeClass}" />
	<p class="overflow-x-hidden whitespace-pre-wrap break-words text-lg leading-snug">
		{name}
	</p>
</div>
