<script lang="ts">
	import type { CurrencySupportKeys } from '$lib/utilities/currency';
	import type { SelectItem } from '$lib/utilities/select';
	import { paymentCurrencyParam } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';

	type Props = {
		bookId: string;
		currencyList: SelectItem<CurrencySupportKeys>[];
		primaryCurrency: CurrencySupportKeys;
	};
	let { bookId, currencyList, primaryCurrency }: Props = $props();

	const primaryCurrencies = $state(
		currencyList.filter((currency) => {
			return currency.value === primaryCurrency;
		})
	);

	const secondaryCurrencies = $state(
		currencyList.filter((currency) => {
			return currency.value !== primaryCurrency;
		})
	);
</script>

<div>
	{#each primaryCurrencies as currency}
		<a
			href="/redirect/book/{bookId}/buy?{paymentCurrencyParam}={currency.value}"
			class="mb-2 inline-block rounded-lg bg-primary-200 px-4 py-3 text-2xl hover:bg-primary-300 focus:bg-primary-300"
			data-sveltekit-reload>Buy for {currency.label}</a
		>
	{/each}
	<div class="relative">
		<Dropdown
			name="lang_select"
			openerColorClass=""
			dropdownClass="-start-[1.0625rem] top-8 min-w-72 max-md:max-w-[28rem] md:w-[30rem]"
		>
			{#snippet opener()}
				<p class="inline-block px-1 text-lg underline">Use other currency</p>
			{/snippet}
			<div class="flex flex-wrap items-center gap-3 p-2">
				{#each secondaryCurrencies as currency}
					<a
						href="/redirect/book/{bookId}/buy?{paymentCurrencyParam}={currency.value}"
						class="inline-block rounded bg-primary-200 px-3 py-2 text-lg hover:bg-primary-200 focus:bg-primary-200"
						data-sveltekit-reload>{currency.label}</a
					>
				{/each}
			</div>
		</Dropdown>
	</div>
</div>
