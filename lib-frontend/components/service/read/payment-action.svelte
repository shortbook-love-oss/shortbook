<script lang="ts">
	import type { CurrencySupportCodes } from '$lib/utilities/currency';
	import type { SelectItem, SelectListGroup } from '$lib/utilities/select';
	import { paymentCurrencyParam } from '$lib/utilities/url';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	type Props = {
		bookId: string;
		currencyList: SelectListGroup<CurrencySupportCodes>[];
		primaryCurrency: SelectItem<CurrencySupportCodes> | null;
	};
	let { bookId, currencyList, primaryCurrency }: Props = $props();
</script>

<div class="flex flex-col items-start gap-4">
	{#if primaryCurrency}
		<a
			href="/redirect/book/{bookId}/buy?{paymentCurrencyParam}={primaryCurrency.value}"
			class="block rounded-md bg-primary-700 px-4 py-3 text-3xl font-semibold text-white hover:bg-primary-500 focus:bg-primary-500"
			data-sveltekit-reload>Buy for {primaryCurrency.text}</a
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
		<div class="flex flex-wrap items-center gap-3">
			{#each currencyList as group (group.label)}
				<p class="mt-2 text-2xl">{group.label}</p>
				{#each group.childs as currency (currency.value)}
					<a
						href="/redirect/book/{bookId}/buy?{paymentCurrencyParam}={currency.value}"
						class="inline-block rounded bg-primary-200 px-3 py-2 text-lg hover:bg-primary-200 focus:bg-primary-200"
						data-sveltekit-reload>{currency.text}</a
					>
				{/each}
			{/each}
		</div>
	</Dialog>
</div>
