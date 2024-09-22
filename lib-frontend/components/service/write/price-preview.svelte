<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		currencySelect,
		formatPrice,
		getCurrencyData,
		getLocalizedPrice,
		type CurrencySupportCodes
	} from '$lib/utilities/currency';
	import { chargeFee } from '$lib/utilities/payment';
	import { getLanguageTagFromUrl } from '$lib/utilities/url';
	import Select from '$lib/components/modules/form/select.svelte';

	type Props = {
		point: number;
		selectedCurrencyKey: CurrencySupportCodes;
		currencyRates: Partial<Record<CurrencySupportCodes, number>>;
	};
	let { point, selectedCurrencyKey, currencyRates }: Props = $props();

	let isEnableJS = $state(false);
	onMount(() => (isEnableJS = true));

	const requestLang = getLanguageTagFromUrl($page.url);
	let buyCurrencySelected = $state('' as CurrencySupportCodes);
	buyCurrencySelected = selectedCurrencyKey;
	let earnCurrencySelected = $state('' as CurrencySupportCodes);
	earnCurrencySelected = selectedCurrencyKey;

	const pointToPriceRates = $derived.by(() => {
		const localRates: Partial<Record<CurrencySupportCodes, number>> = {};
		for (const key in currencyRates) {
			const localKey = key as CurrencySupportCodes;
			const rate = currencyRates[localKey];
			if (rate) {
				localRates[localKey] = rate * point;
			}
		}
		return localRates;
	});

	const buyPrice = $derived.by(() => {
		const currencyData = getCurrencyData(buyCurrencySelected);
		const priceBase = pointToPriceRates[buyCurrencySelected];
		let price;
		if (priceBase) {
			price = priceBase * (100 / (100 - chargeFee));
		}
		return displayPrice(price, currencyData, 1);
	});

	const earnPrice = $derived.by(() => {
		const currencyData = getCurrencyData(earnCurrencySelected);
		const priceBase = pointToPriceRates[earnCurrencySelected];
		return displayPrice(priceBase, currencyData, 1);
	});

	const earnPrice100Sold = $derived.by(() => {
		const currencyData = getCurrencyData(earnCurrencySelected);
		const priceBase = pointToPriceRates[earnCurrencySelected];
		return displayPrice(priceBase, currencyData, 100);
	});

	function displayPrice(
		price: number | undefined,
		currencyData: ReturnType<typeof getCurrencyData>,
		quantity: number
	) {
		if (!currencyData || price == undefined) {
			return undefined;
		}
		const l10nPrice = getLocalizedPrice(price * quantity, currencyData.allowDecimal);

		return formatPrice(l10nPrice, currencyData.value, requestLang);
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
					bind:value={buyCurrencySelected as string}
					name="buyCurrency"
					list={currencySelect}
					className="w-28 text-lg shrink-0"
				/>
			</div>
		{/if}
		<div class="mb-4">
			Total service fee and transaction fee is <span class="font-semibold">{chargeFee}%</span>
		</div>
		{#if earnPrice != undefined}
			<div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
				<p>
					You get {point} points =
					<span class="text-2xl font-semibold">{earnPrice}</span>
				</p>
				<Select
					bind:value={earnCurrencySelected as string}
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
