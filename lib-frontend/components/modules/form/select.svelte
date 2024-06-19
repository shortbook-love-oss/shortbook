<script lang="ts">
	export let value: string;
	export let list: Item[];
	export let name: string;
	export let className = '';
	export let label = '';
	export let required = false;
	export let inputClass = '';
	export let errorMessage = '';

	type Item = {
		value: string;
		text: string;
	};
</script>

<label class="block {className}">
	{#if label}
		<div class="mb-2 flex items-end">
			<p class="text-lg">{label}</p>
			{#if required}
				<div class="ml-4 py-0.5 text-red-800">Required</div>
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
			class="invalid block w-full appearance-none rounded-md border py-2 pl-3 pr-10 invalid:border-2 invalid:border-red-600 {errorMessage
				? 'bborder-2 order-red-700'
				: 'border-stone-600'} {inputClass}"
		>
			{#each list as item}
				<option value={item.value} selected={item.value === value}>{item.text}</option>
			{/each}
		</select>
	</div>
	{#if errorMessage}
		<p class="mt-2 text-red-800">{errorMessage}</p>
	{/if}
</label>
