<script lang="ts">
	import type { ValidationErrors } from 'sveltekit-superforms';

	type Props = {
		value: string;
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
	<div class="relative min-h-48 break-all">
		<!-- "textarea" height is the same as inner content height -->
		<textarea
			{...restProps}
			{name}
			{required}
			bind:value
			class="overflow-none absolute start-0 top-0 block h-full w-full resize-none rounded-md border border-stone-700 px-4 py-2 disabled:bg-stone-100 disabled:text-stone-500 [&:user-invalid]:border-2 [&:user-invalid]:border-red-700 {errorMessages?.length
				? 'border-2 border-red-700'
				: 'border-stone-600'} {inputClass}"
			aria-invalid={errorMessages?.length ? true : undefined}
		></textarea>
		<div class="min-h-48 whitespace-pre-wrap break-words rounded-md border px-4 py-2">
			{value + '\u200b'}
		</div>
	</div>
	{#if Array.isArray(errorMessages) && errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</label>
