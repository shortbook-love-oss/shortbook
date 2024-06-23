<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside';
	import IconClose from '~icons/mdi/close';

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
	class="peer/common_dialog_open w-full rounded-lg text-start hover:bg-stone-200 focus:bg-stone-200"
	on:click|self={openDialog}
>
	<label for="common_dialog_open_{name}">
		<slot name="opener" />
	</label>
	<input type="radio" name="common_dialog_{name}" id="common_dialog_open_{name}" class="hidden" />
</button>

<!-- Dialog -->
<div
	id="common_dialog_{name}"
	class="invisible fixed left-[999%] top-0 z-50 flex h-dvh h-screen w-screen items-center justify-center bg-stone-400/30 p-4 peer-has-[:checked]/common_dialog_open:visible peer-has-[:checked]/common_dialog_open:left-0"
>
	<div
		class="inline-flex max-h-full max-w-2xl flex-col rounded-xl border-2 border-primary-300 bg-white"
		use:clickoutside
		on:clickoutside={closeDialog}
	>
		<div class="flex justify-end pb-1">
			<label class="inline-block">
				<slot name="closer">
					<div class="leading-none">
						<IconClose
							width="44"
							height="44"
							class="ml-auto rounded-es rounded-se-[0.625rem] p-1 hover:bg-stone-200 focus:bg-stone-200"
							aria-label="Cancel and close dialog"
						/>
					</div>
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
		<div class="overflow-x-auto px-4 py-1 sm:pr-6 md:pl-6 md:pr-8">
			<slot />
		</div>
		<div class="px-4 pb-4 pt-1">
			<slot name="actions" />
		</div>
	</div>
</div>
