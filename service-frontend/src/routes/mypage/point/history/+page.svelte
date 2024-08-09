<script lang="ts">
	import IconCash from '~icons/mdi/attach-money';
	import { page } from '$app/stores';
	import { getPaymentProvider } from '$lib/utilities/payment';
	import type { PointListItem } from '$lib/utilities/point';
	import { getLanguageTagFromUrl } from '$lib/utilities/url';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let data;

	function getStatus(point: PointListItem) {
		if (point.isSell) {
			return { amountSuffix: 'Sold', text: 'Sold', bgColor: 'bg-emerald-100' };
		} else if (point.amount > 0) {
			const providerName = getPaymentProvider(point.paymentProvider)?.label;
			const text = providerName ? `Charged (${providerName})` : 'Charged';
			return { amountSuffix: 'Charged', text, bgColor: 'bg-orange-100' };
		}
		return { amountSuffix: 'Spent', text: 'Bought', bgColor: 'bg-stone-200' };
	}
</script>

<svelte:head>
	<title>Point charge / spend history | ShortBook</title>
</svelte:head>

<h1 class="mb-8 text-2xl font-semibold">Charge / spend history</h1>
<div class="mb-12 flex flex-wrap gap-x-8 gap-y-2">
	<div class="text-nowrap">
		<p class="text-xl">Current points</p>
		<p class="text-6xl">{data.currentPoint}</p>
	</div>
	<div class="border-stone-500">
		<NavLinkSmall
			name="Redeem points for cash"
			colorClass="border-stone-600 bg-stone-200"
			className="border cursor-not-allowed mb-1"
		>
			<IconCash width="24" height="24" class="-mx-1" />
		</NavLinkSmall>
		<p>Available in January 2025.</p>
	</div>
</div>
{#if data.pointList.length}
	<ul>
		{#each data.pointList as point}
			<li class="mb-4 flex items-center gap-4 rounded-lg p-4 {getStatus(point).bgColor}">
				<div class="break-keep text-center">
					<p class="text-4xl font-semibold">{Math.abs(point.amount)}</p>
					<p class="text-lg">{getStatus(point).amountSuffix}</p>
				</div>
				<div class="min-w-0">
					{#if point.paymentProvider}
						<p class="text-lg">{getStatus(point).text}</p>
					{:else if point.bookTitle}
						<p class="truncate text-lg">
							{getStatus(point).text}
							<a href="/book/{point.bookId}" class="font-semibold underline">{point.bookTitle}</a>
						</p>
					{/if}
					<time datetime={point.createdAt.toISOString()}
						>{point.createdAt.toLocaleString(getLanguageTagFromUrl($page.url))}</time
					>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p>No point charge / spend yet.</p>
{/if}
