<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside';

	// Need for unique attribute value
	export let name: string;

	// Open dialog by keyboard focus
	function openDialog(e: Event) {
		const openSwitch = document.getElementById('common_dialog_open_' + name) as HTMLInputElement;
		requestAnimationFrame(() => {
			openSwitch.checked = true;
		});
	}

	// Close dialog if open
	const outsideClickThreshold = 50;
	let outsideClickTimeout = 0;
	function closeDialog() {
		const closeSwitch = document.getElementById('common_dialog_close_' + name) as HTMLInputElement;
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
	class="w-fit hover:bg-stone-200 focus:bg-stone-200"
	on:click|self={openDialog}
>
	<label for="common_dialog_open_{name}">
		<slot name="opener" />
	</label>
</button>
<input
	type="radio"
	name="common_dialog_{name}"
	id="common_dialog_open_{name}"
	class="peer/common_dialog_open hidden"
/>

<!-- Dialog -->
<div
	id="common_dialog_{name}"
	class="fixed left-0 top-0 z-50 hidden h-dvh h-screen w-screen items-center justify-center bg-stone-400/30 px-4 peer-checked/common_dialog_open:flex sm:px-6 md:px-8"
>
	<div
		class="w-fit max-w-2xl rounded-xl border-2 border-primary-300 bg-white"
		use:clickoutside
		on:clickoutside={closeDialog}
	>
		<div class="mb-2 text-end">
			<label class="inline-block">
				<slot name="closer">
					<div class="px-3 py-2 hover:bg-stone-200 focus:bg-stone-200">Close</div>
				</slot>
				<input
					type="radio"
					name="common_dialog_{name}"
					checked
					id="common_dialog_close_{name}"
					class="hidden"
				/>
			</label>
		</div>
		<div class="overflow-x-auto px-4 py-3 sm:pr-6 md:pl-6 md:pr-8">
			<slot />
		</div>
		<div class="mt-1 px-4 pb-4">
			<slot name="actions" />
		</div>
	</div>
</div>
