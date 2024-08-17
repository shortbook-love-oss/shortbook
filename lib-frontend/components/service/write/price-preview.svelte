<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		currencySelect,
		formatPrice,
		getCurrencyData,
		getLocalizedPrice,
		type CurrencySupportKeys
	} from '$lib/utilities/currency';
	import { shortbookChargeFee } from '$lib/utilities/payment';
	import { getLanguageTagFromUrl } from '$lib/utilities/url';
	import Select from '$lib/components/modules/form/select.svelte';

	export let point: number;
	export let selectedCurrencyKey: CurrencySupportKeys;
	export let currencyRates: Partial<Record<CurrencySupportKeys, number>>;

	let isEnableJS = false;
	onMount(() => (isEnableJS = true));

	const requestLang = getLanguageTagFromUrl($page.url);
	let buyCurrencySelected = selectedCurrencyKey;
	let earnCurrencySelected = selectedCurrencyKey;

	$: pointToPriceRates = (() => {
		const localRates: Partial<Record<CurrencySupportKeys, number>> = {};
		for (const key in currencyRates) {
			const localKey = key as CurrencySupportKeys;
			const rate = currencyRates[localKey];
			if (rate) {
				localRates[localKey] = rate * point;
			}
		}
		return localRates;
	})();

	$: buyPrice = (() => {
		const currencyData = getCurrencyData(buyCurrencySelected);
		const priceBase = pointToPriceRates[buyCurrencySelected];
		let price;
		if (priceBase) {
			price = priceBase * (100 / (100 - shortbookChargeFee));
		}
		return displayPrice(price, currencyData, 1);
	})();

	$: earnPrice = (() => {
		const currencyData = getCurrencyData(earnCurrencySelected);
		const priceBase = pointToPriceRates[earnCurrencySelected];
		return displayPrice(priceBase, currencyData, 1);
	})();

	$: earnPrice100Sold = (() => {
		const currencyData = getCurrencyData(earnCurrencySelected);
		const priceBase = pointToPriceRates[earnCurrencySelected];
		return displayPrice(priceBase, currencyData, 100);
	})();

	function displayPrice(
		price: number | undefined,
		currencyData: ReturnType<typeof getCurrencyData>,
		quantity: number
	) {
		if (!currencyData || price == undefined) {
			return undefined;
		}
		const l10nPrice = getLocalizedPrice(price * quantity, currencyData.allowDecimal);

		return formatPrice(l10nPrice, currencyData.key, requestLang);
	}
</script>

{#if isEnableJS}
	<div class="rounded-lg bg-primary-100 p-4 text-lg">
		{#if buyPrice != undefined}
			<div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
				<p>
					Sell for <span class="text-2xl font-semibold">{buyPrice}</span>
				</p>
				<Select
					bind:value={buyCurrencySelected}
					name="buyCurrency"
					list={currencySelect}
					className="w-28 text-lg shrink-0"
				/>
			</div>
		{/if}
		<div class="mb-4">
			Total service fee and transaction fee is <span class="font-semibold"
				>{shortbookChargeFee}%</span
			>
		</div>
		{#if earnPrice != undefined}
			<div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
				<p>
					You get {point} points =
					<span class="text-2xl font-semibold">{earnPrice}</span>
				</p>
				<Select
					bind:value={earnCurrencySelected}
					name="buyCurrency"
					list={currencySelect}
					className="w-28 text-lg shrink-0"
				/>
			</div>
		{/if}
		{#if earnPrice100Sold != undefined}
			<p>
				If sell 100 books, get <span class="text-2xl font-semibold">{earnPrice100Sold}</span>
			</p>
		{/if}
	</div>
{/if}
