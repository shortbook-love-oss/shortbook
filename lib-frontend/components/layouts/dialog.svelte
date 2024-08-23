<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconClose from '~icons/mdi/close';
	import { onNavigate } from '$app/navigation';

	type Props = {
		opener: Snippet;
		children: Snippet;
		actions?: Snippet;
		name: string; // Need for unique attribute value
		title?: string;
		openerClass?: string;
		dialogSizeClass?: string;
	};
	let {
		opener,
		children,
		actions,
		name,
		title = '',
		openerClass = '',
		dialogSizeClass = 'max-w-xl'
	}: Props = $props();

	let isEnableJS = $state(false);
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

<label class="peer/common_dialog_open relative block">
	<div class="focus-within:bg-stone-200 hover:bg-stone-200 {openerClass}">
		{@render opener()}
		<input
			type="checkbox"
			name="common_dialog_{name}"
			id="common_dialog_open_{name}"
			class="absolute start-0 top-0 h-full w-full cursor-pointer appearance-none"
			tabindex="0"
		/>
	</div>
</label>

<!-- Dialog -->
<div
	id="common_dialog_{name}"
	class="fixed start-0 top-0 z-50 flex hidden h-dvh w-screen min-w-0 justify-center bg-stone-500/50 peer-has-[:checked]/common_dialog_open:flex"
>
	<label for="common_dialog_open_{name}" class="min-w-4 flex-1" aria-hidden="true"></label>
	<div class="flex w-[calc(100%-2rem)] flex-col {dialogSizeClass}">
		<label for="common_dialog_open_{name}" class="min-h-4 flex-1" aria-hidden="true"></label>
		<div
			role="dialog"
			class="flex max-h-[calc(100%-2rem)] flex-col rounded-xl border-2 border-primary-300 bg-white"
		>
			<div class="flex shrink-0 items-center justify-end overflow-x-auto {title ? 'pb-1' : ''}">
				{#if title}
					<p class="flex-1 px-4 py-1 text-2xl md:pl-6">{title}</p>
				{/if}
				<div
					class="relative mb-auto inline-block shrink-0 rounded-es rounded-se-[0.625rem] leading-none focus-within:bg-stone-200 hover:bg-stone-200"
				>
					{#if isEnableJS}
						<button
							type="button"
							class="absolute start-0 top-0 h-full w-full appearance-none"
							on:click|self={closeDialog}
						></button>
					{/if}
					<label for="common_dialog_open_{name}" class="inline-block h-full">
						<IconClose
							width="44"
							height="44"
							class="ml-auto p-1"
							aria-label="Cancel and close dialog"
						/>
					</label>
				</div>
			</div>
			<div class="overflow-x-auto break-words px-4 py-1 text-lg sm:pr-6 md:pl-6 md:pr-8">
				{@render children()}
			</div>
			<div class="px-4 pb-2 pt-1">
				{#if actions}
					{@render actions()}
				{/if}
			</div>
		</div>
		<label for="common_dialog_open_{name}" class="min-h-4 flex-1" aria-hidden="true"></label>
	</div>
	<label for="common_dialog_open_{name}" class="min-w-4 flex-1" aria-hidden="true"></label>
</div>
