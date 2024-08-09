<script lang="ts">
	import { page } from '$app/stores';
	import { getLanguageTagFromUrl } from '$lib/utilities/url';

	export let data;
</script>

<svelte:head>
	<title>Point charge / spend history | ShortBook</title>
</svelte:head>

<h1 class="mb-8 text-2xl font-semibold">Charge / spend history</h1>
<p class="text-xl">Current points</p>
<p class="mb-8 text-6xl">{data.currentPoint}</p>
{#if data.pointList.length}
	<ul>
		{#each data.pointList as point}
			<li
				class="mb-4 flex items-center gap-4 rounded-lg p-4 {point.amount >= 0
					? 'bg-emerald-100'
					: 'bg-stone-200'}"
			>
				<div>
					<p class="text-4xl font-semibold">{Math.abs(point.amount)}</p>
					<p class="text-lg">{point.amount >= 0 ? 'Charge' : 'Spend'}</p>
				</div>
				<div class="min-w-0">
					{#if point.bookTitle}
						<p class="truncate text-lg">
							Bought <a href="/book/{point.bookId}" class="font-semibold underline"
								>{point.bookTitle}</a
							>
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
