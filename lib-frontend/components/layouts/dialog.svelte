<script lang="ts">
	import { onMount } from 'svelte';
	import IconClose from '~icons/mdi/close';
	import { onNavigate } from '$app/navigation';

	// Need for unique attribute value
	export let name: string;
	export let openerClass = '';

	let isEnableJS = false;
	onMount(() => {
		isEnableJS = true;
	});

	onNavigate(() => {
		closeDialog();
	});

	function closeDialog() {
		const openSwitch = document.getElementById('common_dialog_open_' + name) as HTMLInputElement;
		openSwitch.checked = false;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Escape') {
			closeDialog();
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<label class="peer/common_dialog_open relative">
	<div class="focus-within:bg-stone-200 hover:bg-stone-200 {openerClass}">
		<slot name="opener" />
		<input
			type="checkbox"
			name="common_dialog_{name}"
			id="common_dialog_open_{name}"
			class="absolute left-0 top-0 h-full w-full opacity-0"
			tabindex="0"
		/>
	</div>
</label>

<!-- Dialog -->
<div
	id="common_dialog_{name}"
	class="fixed left-0 top-0 z-50 flex hidden h-dvh h-screen w-screen justify-center bg-stone-400/30 peer-has-[:checked]/common_dialog_open:flex"
>
	<label for="common_dialog_open_{name}" class="min-w-[16px] flex-1" aria-hidden="true" />
	<div class="flex flex-col">
		<label for="common_dialog_open_{name}" class="min-h-[16px] flex-1" aria-hidden="true" />
		<div
			role="dialog"
			class="inline-flex max-h-full max-w-2xl flex-col rounded-xl border-2 border-primary-300 bg-white"
		>
			<div
				class="relative ms-auto inline-flex rounded-es rounded-se-[0.625rem] leading-none focus-within:bg-stone-200 hover:bg-stone-200"
			>
				{#if isEnableJS}
					<button
						type="button"
						class="absolute left-0 top-0 h-full w-full opacity-0"
						on:click|self={closeDialog}
					/>
				{/if}
				<label for="common_dialog_open_{name}" class="inline-block">
					<slot name="closer">
						<IconClose
							width="44"
							height="44"
							class="ml-auto p-1"
							aria-label="Cancel and close dialog"
						/>
					</slot>
				</label>
			</div>
			<div class="overflow-x-auto px-4 py-1 text-lg sm:pr-6 md:pl-6 md:pr-8">
				<slot />
			</div>
			<div class="px-4 pb-4 pt-1">
				<slot name="actions" />
			</div>
		</div>
		<label for="common_dialog_open_{name}" class="min-h-[16px] flex-1" aria-hidden="true" />
	</div>
	<label for="common_dialog_open_{name}" class="min-w-[16px] flex-1" aria-hidden="true" />
</div>
