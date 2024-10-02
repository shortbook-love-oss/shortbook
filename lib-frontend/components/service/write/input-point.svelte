<script lang="ts">
	import { onMount } from 'svelte';
	import type { ValidationErrors } from 'sveltekit-superforms';
	import { bookPointSelect } from '$lib/utilities/book';
	import Number from '$lib/components/modules/form/number.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	type Props = {
		point: number;
		errorMessages?: string[] | ValidationErrors<Record<string, unknown>>;
		className?: string;
		[key: string]: unknown;
	};
	let { point = $bindable(), errorMessages, className = '', ...restProps }: Props = $props();

	let isEnableJS = $state(false);
	onMount(() => (isEnableJS = true));

	function changeBookPoint(amount: number) {
		point = amount;
	}
</script>

<div class="flex flex-wrap items-end gap-2 {className}">
	<Number
		{...restProps}
		min="70"
		max="1000000"
		type="number"
		bind:value={point}
		name="buyPoint"
		label="Selling point amount"
		{errorMessages}
		className="w-48 shrink-0"
	/>
	{#if isEnableJS}
		<div class="flex flex-wrap items-center gap-2">
			{#each bookPointSelect as point (point.value)}
				<button
					type="button"
					aria-label="Set selling point to {point.value}"
					onclick={() => changeBookPoint(point.value)}
				>
					<NavLinkSmall name={point.label} colorClass="bg-primary-200" />
				</button>
			{/each}
		</div>
	{/if}
</div>
