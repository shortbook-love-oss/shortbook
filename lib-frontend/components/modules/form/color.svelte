<script lang="ts">
	import type { ValidationErrors } from 'sveltekit-superforms';

	type Props = {
		value: string; // '#rrggbb' or 'transparent'
		name: string;
		label?: string;
		errorMessages?: string[] | ValidationErrors<Record<string, unknown>>;
		className?: string;
		inputClass?: string;
		[key: string]: unknown;
	};
	let {
		value = $bindable(),
		name,
		label = '',
		errorMessages,
		className = '',
		inputClass = '',
		...restProps
	}: Props = $props();
</script>

<label class="block {className}">
	{#if label}
		<div class="mb-2 flex items-end gap-4">
			<p class="text-lg">{label}</p>
		</div>
	{/if}
	<div class="flex items-center rounded-md border border-stone-700 px-4 py-2 text-lg">
		<p class="flex-1">{value}</p>
		<input
			type="color"
			{...restProps}
			bind:value
			{name}
			class="relative h-[1.5em] w-[1.5em] shrink-0 appearance-none overflow-hidden rounded border-0 bg-transparent align-middle [&::-moz-color-swatch]:absolute [&::-moz-color-swatch]:start-0 [&::-moz-color-swatch]:top-0 [&::-moz-color-swatch]:h-[1.5em] [&::-moz-color-swatch]:w-[1.5em] [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:absolute [&::-webkit-color-swatch]:start-0 [&::-webkit-color-swatch]:top-0 [&::-webkit-color-swatch]:h-[1.5em] [&::-webkit-color-swatch]:w-[1.5em] [&::-webkit-color-swatch]:border-0 {inputClass}"
			aria-invalid={errorMessages?.length ? true : undefined}
		/>
	</div>
	{#if Array.isArray(errorMessages) && errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</label>
