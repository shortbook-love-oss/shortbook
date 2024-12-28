<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ValidationErrors } from 'sveltekit-superforms';
	import IconCheck from '~icons/mdi/check-bold';
	import * as m from '$i18n/output/messages';

	type Props = {
		checked: boolean;
		name: string;
		required?: boolean;
		errorMessages?: string[] | ValidationErrors<Record<string, unknown>>;
		className?: string;
		inputClass?: string;
		[key: string]: unknown;
	} & ({ label: string; children?: never } | { label?: never; children?: Snippet });
	let {
		checked = $bindable(),
		name,
		label = '',
		children,
		required = false,
		errorMessages,
		className = '',
		inputClass = '',
		...restProps
	}: Props = $props();
</script>

<div class={className}>
	<label class="inline-flex items-center gap-3">
		<div class="peer relative">
			<input
				type="checkbox"
				{...restProps}
				{name}
				{required}
				bind:checked
				class="peer absolute left-0 top-0 z-[-1] box-border h-full w-full appearance-none rounded {inputClass}"
				aria-invalid={errorMessages?.length ? true : undefined}
			/>
			<IconCheck
				width="32"
				height="32"
				class="shrink-0 rounded border-stone-700 text-transparent peer-checked:bg-primary-700 peer-checked:text-stone-50 peer-disabled:bg-stone-200 peer-[&:not(:checked)]:border peer-[&:checked:disabled]:bg-stone-400 peer-[&:not(:checked):not(:disabled)]:hover:text-stone-300"
			/>
		</div>
		<div class="flex items-center gap-4">
			{#if children}
				<div>{@render children()}</div>
			{:else}
				<p class="text-lg [word-break:break-word]">{label}</p>
			{/if}
			{#if required}
				<div class="text-base text-red-800">{m.input_required()}</div>
			{/if}
		</div>
	</label>
	{#if Array.isArray(errorMessages) && errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</div>
