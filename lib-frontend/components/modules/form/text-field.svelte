<script lang="ts">
	import type { ValidationErrors } from 'sveltekit-superforms';

	export let value: string | number;
	export let name: string;
	export let className = '';
	export let label = '';
	export let required = false;
	export let inputClass = '';
	export let errorMessages: string[] | ValidationErrors<Record<string, unknown>> | undefined =
		undefined;
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
	<input
		{...$$restProps}
		{name}
		{required}
		bind:value
		class="block w-full rounded-md border border-stone-700 px-4 py-2 disabled:bg-stone-100 disabled:text-stone-500 [&:user-invalid]:border-2 [&:user-invalid]:border-red-700 {errorMessages?.length
			? 'border-2 border-red-700'
			: 'border-stone-600'} {inputClass}"
		aria-invalid={errorMessages?.length ? true : undefined}
		on:input
	/>
	{#if Array.isArray(errorMessages) && errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</label>
