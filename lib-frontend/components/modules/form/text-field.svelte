<script lang="ts">
	export let value: string;
	export let name: string;
	export let className = '';
	export let label = '';
	export let required = false;
	export let inputClass = '';
	export let errorMessage = '';
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
	<input
		{...$$restProps}
		{name}
		{required}
		bind:value
		class="block w-full rounded-md border px-4 py-2 invalid:border-2 invalid:border-red-600 {errorMessage
			? 'border-2 border-red-700'
			: 'border-stone-600'} {inputClass}"
	/>
	{#if errorMessage}
		<p class="mt-2 text-red-800">{errorMessage}</p>
	{/if}
</label>
