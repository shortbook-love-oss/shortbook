<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconMenu from '~icons/mdi/menu';
	import IconClose from '~icons/mdi/close';
	import { onNavigate } from '$app/navigation';

	// Need for unique attribute value
	type Props = {
		opener?: Snippet;
		children: Snippet;
		name: string;
	};
	let { opener, children, name }: Props = $props();

	let isEnableJS = $state(false);
	onMount(() => {
		isEnableJS = true;
	});

	onNavigate(() => {
		closeOverlay();
	});

	function closeOverlay() {
		const openSwitch = document.getElementById('common_overlay_open_' + name) as HTMLInputElement;
		openSwitch.checked = false;
	}
</script>

<label class="peer/common_overlay_open relative focus-within:bg-stone-200 hover:bg-stone-200">
	{#if opener}
		{@render opener()}
	{:else}
		<div class="p-2">
			<IconMenu width="28" height="28" />
		</div>
	{/if}
	<input
		type="checkbox"
		name="common_overlay_{name}"
		id="common_overlay_open_{name}"
		class="absolute start-0 top-0 h-full w-full cursor-pointer appearance-none"
	/>
</label>

<!-- Overlay -->
<div
	id="common_overlay_{name}"
	class="fixed start-0 top-0 z-40 hidden h-dvh w-screen bg-stone-500/50 peer-has-[:checked]/common_overlay_open:flex"
>
	<div class="inline-flex h-full flex-col border-r border-primary-300 bg-white">
		<div class="relative ms-auto inline-block flex focus-within:bg-stone-200 hover:bg-stone-200">
			{#if isEnableJS}
				<button
					type="button"
					class="absolute start-0 top-0 h-full w-full appearance-none"
					on:click|self={closeOverlay}
				></button>
			{/if}
			<label for="common_overlay_open_{name}" class="ms-auto block">
				<IconClose width="44" height="44" class="p-1" aria-label="Cancel and close overlay" />
			</label>
		</div>
		<div class="flex-1 overflow-x-auto p-2">
			{@render children()}
		</div>
	</div>
	<label for="common_overlay_open_{name}" class="flex-1" aria-hidden="true"></label>
</div>
