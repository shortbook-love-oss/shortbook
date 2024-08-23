<script lang="ts">
	import type { ValidationErrors } from 'sveltekit-superforms';

	type Props = {
		value: number;
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
		name,
		label = '',
		required = false,
		errorMessages,
		className = '',
		inputClass = '',
		...restProps
	}: Props = $props();

	const id = $state(`input-range-name-${name}`);
</script>

<div class="block {className}">
	{#if label}
		<div class="mb-1 flex items-end gap-4">
			<label for={id} class="block pb-px text-lg">{label}</label>
			{#if required}
				<div class="pb-1 text-base text-red-800">Required</div>
			{/if}
		</div>
	{/if}
	<div class="relative">
		<input
			type="range"
			{...restProps}
			bind:value
			{name}
			{id}
			class="peer w-full accent-primary-700 {inputClass}"
			aria-invalid={errorMessages?.length ? true : undefined}
		/>
		<div
			class="absolute bottom-7 end-0 hidden w-fit peer-hover:inline-block peer-focus:inline-block"
		>
			<p class="rounded-md border border-stone-400 bg-white px-2 py-0.5">{value}</p>
		</div>
	</div>
	{#if Array.isArray(errorMessages) && errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</div>
