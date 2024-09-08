<script lang="ts">
	import type { ValidationErrors } from 'sveltekit-superforms';
	import type { SelectItem } from '$lib/utilities/select';

	type Props = {
		value: string | number;
		list: SelectItem<string | number>[];
		name: string;
		label?: string;
		required?: boolean;
		errorMessages?: string[] | ValidationErrors<Record<string, unknown>>;
		className?: string;
		inputClass?: string;
		[key: string]: unknown;
	};
	let {
		value = $bindable(),
		list,
		name,
		label = '',
		required = false,
		errorMessages,
		className = '',
		inputClass = '',
		...restProps
	}: Props = $props();

	// When value changed by outside, reselect value-match item
	const displayList = $state(
		list.map((item) => {
			const displayItem: SelectItem<string | number> = {
				...item,
				selected: item.value === value
			};
			return displayItem;
		})
	);
</script>

<label class="block {className}">
	{#if label}
		<div class="mb-1 flex items-end gap-4">
			<p class="pb-px text-lg">{label}</p>
			{#if required}
				<div class="pb-1 text-base text-red-800">Required</div>
			{/if}
		</div>
	{/if}
	<div
		class="relative after:pointer-events-none after:absolute after:right-4 after:top-1/2 after:inline-block after:h-3 after:w-3 after:-translate-y-2 after:rotate-45 after:border-b-[3px] after:border-r-[3px] after:border-stone-950"
	>
		<select
			{...restProps}
			bind:value
			{name}
			{required}
			class="block w-full appearance-none rounded-md border border-stone-700 bg-white py-2 pl-3 pr-10 disabled:bg-stone-100 disabled:text-stone-500 disabled:opacity-100 [&:user-invalid]:border-2 [&:user-invalid]:border-red-700 {errorMessages?.length
				? 'border-2 border-red-700'
				: 'border-stone-600'} {inputClass}"
			aria-invalid={errorMessages?.length ? true : undefined}
		>
			{#each displayList as item}
				<option value={item.value} selected={item.selected}>{item.label}</option>
			{/each}
		</select>
	</div>
	{#if Array.isArray(errorMessages) && errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</label>
