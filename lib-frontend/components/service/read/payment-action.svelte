<script lang="ts">
	import type { CurrencySupportCodes } from '$lib/utilities/currency';
	import { type SelectItemSingle, type SelectItem, isSelectGroup } from '$lib/utilities/select';
	import { paymentCurrencyParam } from '$lib/utilities/url';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	type Props = {
		bookId: string;
		currencyList: SelectItem<CurrencySupportCodes>[];
		primaryCurrency: SelectItemSingle<CurrencySupportCodes> | null;
	};
	let { bookId, currencyList, primaryCurrency }: Props = $props();
</script>

<div class="flex flex-col items-start gap-4">
	{#if primaryCurrency}
		<a
			href="/redirect/book/{bookId}/buy?{paymentCurrencyParam}={primaryCurrency.value}"
			class="block rounded-md bg-primary-700 px-4 py-3 text-2xl font-semibold text-white hover:bg-primary-500 focus:bg-primary-500"
			data-sveltekit-reload>Buy for <span translate="no">{primaryCurrency.text}</span></a
		>
	{/if}
	<Dialog
		name="lang_select"
		title="Buy in your currency"
		openerColorClass=""
		dialogSizeClass="max-w-xl"
	>
		{#snippet opener()}
			<p class="inline-block text-lg underline">Use other currency</p>
		{/snippet}
		{#each currencyList as group, i (group.label)}
			<p class="mb-6 border-b-2 border-primary-700 py-1 text-2xl {i ? 'mt-12' : ''}">
				{group.label}
			</p>
			{#if isSelectGroup(group)}
				{#each group.childs as currency (currency.value)}
					{#if currency.text}
						<div class="mb-6 flex flex-col gap-x-4 gap-y-2 xs:flex-row xs:items-center">
							<a
								href="/redirect/book/{bookId}/buy?{paymentCurrencyParam}={currency.value}"
								translate="no"
								data-sveltekit-reload
								class="text-3xl font-semibold hover:underline">{currency.text}</a
							>
							<p class="text-lg">
								{currency.label} <span translate="no">({currency.value.toUpperCase()})</span>
							</p>
						</div>
					{/if}
				{/each}
			{/if}
		{/each}
	</Dialog>
</div>
