<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside';

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

<button type="button" class="w-fit hover:bg-stone-200 focus:bg-stone-200">
	<label for="common_overlay_open_{name}">
		<slot name="opener">
			<p>Click to show overlay</p>
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
	class="t-0 l-0 fixed z-40 hidden h-dvh h-screen border-r border-primary-300 bg-white peer-checked/common_overlay_open:block"
	use:clickoutside
	on:clickoutside={closeOverlay}
>
	<div class="text-end">
		<label class="inline-block">
			<slot name="closer">
				<div class="px-2 px-3 px-3 py-2 text-end hover:bg-stone-200 focus:bg-stone-200">Close</div>
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
  <div class="px-2 -mt-2">
	  <slot />
  </div>
</div>
