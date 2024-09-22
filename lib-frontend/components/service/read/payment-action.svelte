<script lang="ts">
	import type { CurrencySupportValues } from '$lib/utilities/currency';
	import type { SelectItem } from '$lib/utilities/select';
	import { paymentCurrencyParam } from '$lib/utilities/url';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	type Props = {
		bookId: string;
		currencyList: SelectItem<CurrencySupportValues>[];
		primaryCurrency: CurrencySupportValues;
	};
	let { bookId, currencyList, primaryCurrency }: Props = $props();

	const primaryCurrencies = $state(
		currencyList.filter((currency) => {
			return currency.value === primaryCurrency;
		})
	);
</script>

<div class="flex flex-col items-start gap-4">
	{#each primaryCurrencies as currency}
		<a
			href="/redirect/book/{bookId}/buy?{paymentCurrencyParam}={currency.value}"
			class="mb-2 block rounded-md bg-primary-700 px-4 py-3 text-3xl font-semibold text-white hover:bg-primary-500 focus:bg-primary-500"
			data-sveltekit-reload>Buy for {currency.label}</a
		>
	{/each}
	<Dialog
		name="lang_select"
		title="Buy in your currency"
		openerColorClass=""
		dialogSizeClass="max-w-xl"
	>
		{#snippet opener()}
			<p class="inline-block text-lg underline">Use other currency</p>
		{/snippet}
		<div class="flex flex-wrap items-center gap-3">
			{#each currencyList as currency}
				<a
					href="/redirect/book/{bookId}/buy?{paymentCurrencyParam}={currency.value}"
					class="inline-block rounded bg-primary-200 px-3 py-2 text-lg hover:bg-primary-200 focus:bg-primary-200"
					data-sveltekit-reload>{currency.label}</a
				>
			{/each}
		</div>
	</Dialog>
</div>
