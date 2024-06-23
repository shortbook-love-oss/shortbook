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

<button
	type="button"
	class="peer/common_dropdown_open inline-flex hover:bg-stone-200 focus:bg-stone-200"
>
	<label>
		<slot name="opener" />
		<input
			type="radio"
			name="common_dropdown_{name}"
			id="common_dropdown_open_{name}"
			class="hidden"
		/>
	</label>
</button>

<!-- Dropdown -->
<div
	id="common_dropdown_{name}"
	class="max-w-screen invisible fixed left-[999%] z-40 flex max-h-dvh max-h-screen flex-col rounded-lg border-2 border-stone-400 bg-white peer-has-[:checked]/common_dropdown_open:visible peer-has-[:checked]/common_dropdown_open:left-auto {dropdownClass}"
	use:clickoutside
	on:clickoutside={closeDropdown}
>
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
	<div class="border-t border-stone-400 p-2">
		<label for="common_dropdown_close_{name}" class="block">
			<slot name="closer" />
		</label>
	</div>
</div>
