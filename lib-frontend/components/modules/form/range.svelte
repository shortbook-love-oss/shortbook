<script lang="ts">
	export let value: number;
	export let name: string;
	export let className = '';
	export let label = '';
	export let required = false;
	export let inputClass = '';
	export let errorMessages: string[] | undefined = undefined;

	$: id = `input-range-name-${name}`;
</script>

<div class="block {className}">
	{#if label}
		<div class="mb-2 flex items-end gap-4">
			<label for={id} class="block text-lg">{label}</label>
			{#if required}
				<div class="pb-0.5 text-red-800">Required</div>
			{/if}
		</div>
	{/if}
	<div class="relative">
		<input
			type="range"
			{...$$restProps}
			bind:value
			{name}
			{id}
			class="peer w-full accent-primary-700 {inputClass}"
			aria-invalid={errorMessages?.length ? true : undefined}
		/>
		<div
			class="absolute bottom-8 end-0 hidden w-fit peer-hover:inline-block peer-focus:inline-block"
		>
			<p class="rounded-md border border-stone-400 bg-white px-2 py-1">{value}</p>
		</div>
	</div>
	{#if errorMessages?.length}
		<div class="mt-2 text-red-800">
			{#each errorMessages as errorMessage}
				<p class="mt-1">{errorMessage}</p>
			{/each}
		</div>
	{/if}
</div>
