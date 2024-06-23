<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside';
	import IconMenu from '~icons/mdi/menu';
	import IconClose from '~icons/mdi/close';

	// Need for unique attribute value
	export let name: string;

	// Close submenu if open
	const outsideClickThreshold = 50;
	let outsideClickTimeout = 0;
	function closeOverlay() {
		const closeSwitch = document.getElementById('common_overlay_close_' + name) as HTMLInputElement;
		if (outsideClickTimeout === 0) {
			closeSwitch.checked = true;
		}
		// Anti-chattering measures
		outsideClickTimeout = window.setTimeout(() => {
			outsideClickTimeout = 0;
		}, outsideClickThreshold);
	}
</script>

<button type="button" class="inline-flex items-center hover:bg-stone-200 focus:bg-stone-200">
	<label for="common_overlay_open_{name}">
		<slot name="opener">
			<div class="p-2">
				<IconMenu width="28" height="28" />
			</div>
		</slot>
	</label>
</button>
<input
	type="radio"
	name="common_overlay_{name}"
	id="common_overlay_open_{name}"
	class="peer/common_overlay_open hidden"
/>

<!-- Overlay -->
<div
	id="common_overlay_{name}"
	class="fixed left-0 top-0 z-40 hidden h-dvh h-screen w-screen bg-stone-400/30 peer-checked/common_overlay_open:block"
>
	<div
		class="inline-flex h-full flex-col border-r border-primary-300 bg-white"
		use:clickoutside
		on:clickoutside={closeOverlay}
	>
		<div class="flex justify-end">
			<label class="ms-auto block">
				<slot name="closer">
					<IconClose
						width="44"
						height="44"
						class="p-1 hover:bg-stone-200 focus:bg-stone-200"
						aria-label="Cancel and close dialog"
					/>
				</slot>
				<input
					type="radio"
					name="common_overlay_{name}"
					checked
					id="common_overlay_close_{name}"
					class="hidden"
				/>
			</label>
		</div>
		<div class="flex-1 overflow-x-auto p-2">
			<slot />
		</div>
	</div>
</div>
