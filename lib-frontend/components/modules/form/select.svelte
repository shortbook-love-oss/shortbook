<script lang="ts">
	export let value: string;
	export let list: Item[];
	export let name: string;
	export let className = '';
	export let label = '';
	export let required = false;
	export let inputClass = '';
	export let errorMessages: string[] | undefined = undefined;

	type Item = {
		value: string;
		text: string;
	};
</script>

<label class="block {className}">
	{#if label}
		<div class="mb-2 flex items-end gap-4">
			<p class="text-lg">{label}</p>
			{#if required}
				<div class="pb-0.5 text-red-800">Required</div>
			{/if}
		</div>
	{/if}
	<div
		class="relative after:pointer-events-none after:absolute after:right-4 after:top-1/2 after:inline-block after:h-3 after:w-3 after:-translate-y-2 after:rotate-45 after:border-b-[3px] after:border-r-[3px] after:border-stone-950"
	>
		<select
			{...$$restProps}
			{name}
			{required}
			bind:value
			class="invalid block w-full appearance-none rounded-md border border-stone-700 py-2 pl-3 pr-10 invalid:border-2 invalid:border-red-700 disabled:bg-stone-100 disabled:text-stone-500 disabled:opacity-100 {errorMessages?.length
				? 'border-2 border-red-700'
				: 'border-stone-600'} {inputClass}"
			aria-invalid={errorMessages?.length ? true : undefined}
		>
			{#each list as item}
				<option value={item.value} selected={item.value === value}>{item.text}</option>
			{/each}
		</select>
	</div>
	{#if errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</label>
