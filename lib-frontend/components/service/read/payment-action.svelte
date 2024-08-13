<script lang="ts">
	import type { CurrencySupportKeys } from '$lib/utilities/currency';
	import type { SelectItem } from '$lib/utilities/select';
	import { paymentCurrencyParam } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';

	export let bookId: string;
	export let currencyList: SelectItem<CurrencySupportKeys>[];
	export let primaryCurrency: CurrencySupportKeys;

	$: primaryCurrencies = currencyList.filter((currency) => {
		return currency.value === primaryCurrency;
	});

	$: secondaryCurrencies = currencyList.filter((currency) => {
		return currency.value !== primaryCurrency;
	});
</script>

<div class="relative flex flex-wrap items-center gap-4">
	{#each primaryCurrencies as currency}
		<a
			href="/book/{bookId}/buy?{paymentCurrencyParam}={currency.value}"
			class="inline-block rounded-lg bg-primary-200 px-4 py-3 text-2xl hover:bg-primary-300 focus:bg-primary-300"
			data-sveltekit-reload>Pay {currency.label}</a
		>
	{/each}
	<Dropdown
		name="lang_select"
		openerColorClass=""
		dropdownClass="-left-[1.0625rem] bottom-12 min-w-72 max-w-[28rem]"
	>
		<div slot="opener">
			<p class="inline-block px-1 text-lg underline">Use other currency</p>
		</div>
		<div class="flex flex-wrap items-center gap-3 p-2">
			{#each secondaryCurrencies as currency}
				<a
					href="/book/{bookId}/buy?{paymentCurrencyParam}={currency.value}"
					class="inline-block rounded bg-primary-100 px-3 py-2 text-lg hover:bg-primary-200 focus:bg-primary-200"
					data-sveltekit-reload>{currency.label}</a
				>
			{/each}
		</div>
	</Dropdown>
</div>
