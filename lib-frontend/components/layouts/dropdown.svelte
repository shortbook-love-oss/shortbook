<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside';

	// Need for unique attribute value
	export let name: string;
	export let dropdownClass = '';

	// Close submenu if open
	const outsideClickThreshold = 50;
	let outsideClickTimeout = 0;
	function closeDropdown() {
		const closeSwitch = document.getElementById(
			'common_dropdown_close_' + name
		) as HTMLInputElement;
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
	<label for="common_dropdown_open_{name}">
		<slot name="opener" />
	</label>
</button>
<input
	type="radio"
	name="common_dropdown_{name}"
	id="common_dropdown_open_{name}"
	class="peer/common_dropdown_open hidden"
/>

<!-- Dropdown -->
<div
	id="common_dropdown_{name}"
	class="max-w-screen absolute z-40 hidden max-h-dvh max-h-screen flex-col rounded-lg border-2 border-stone-400 bg-white peer-checked/common_dropdown_open:flex {dropdownClass}"
	use:clickoutside
	on:clickoutside={closeDropdown}
>
	<div class="border-b border-stone-400 p-2">
		<label for="common_dropdown_close_{name}" class="block">
			<slot name="closer" />
		</label>
	</div>
	<input
		type="radio"
		name="common_dropdown_{name}"
		checked
		id="common_dropdown_close_{name}"
		class="hidden"
	/>
	<div class="flex-1 overflow-x-auto p-2">
		<slot />
	</div>
</div>
