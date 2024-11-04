<script lang="ts">
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import { page } from '$app/stores';
	import { toLocaleDatetime } from '$lib/utilities/date';
	import { getLanguageTagFromUrl } from '$lib/utilities/url';

	type Props = {
		bookStatus: number;
		lastSaved: Date | null;
		isAutoSaved: boolean;
		className?: string;
		onSave: () => void;
	};
	let { bookStatus, lastSaved, isAutoSaved, className = '', onSave }: Props = $props();

	const requestLang = getLanguageTagFromUrl($page.url);

	const savedLabel = $derived.by(() => {
		const datetime = toLocaleDatetime(lastSaved, requestLang);
		if (lastSaved) {
			if (isAutoSaved) {
				return `Auto saved at ${datetime}`;
			} else {
				return `Last edited at ${datetime}`;
			}
		} else {
			return undefined;
		}
	});
</script>

<header class="fixed start-0 top-0 z-10 flex items-center {className}">
	<nav
		class="flex items-center gap-1 rounded-ee-lg border-b border-e border-stone-300 bg-white pl-[env(safe-area-inset-left,0px)] pt-[env(safe-area-inset-top,0px)] rtl:pr-[env(safe-area-inset-right,0px)]"
	>
		<a
			href="/write"
			class="block shrink-0 p-3 hover:bg-stone-200 focus:bg-stone-200"
			title="Back to my articles list"
		>
			<IconArrowLeft width="24" height="24" class="rtl:rotate-180" />
		</a>
		<div class="min-w-20 leading-tight">
			<p class="text-stone-700">
				{#if bookStatus === 0}
					Draft
				{:else}
					Published
				{/if}
			</p>
			<p class="text-stone-500" title={savedLabel}>
				{#if isAutoSaved}
					Saved
				{:else}
					Auto save
				{/if}
			</p>
		</div>
		<button
			type="button"
			class="mx-1.5 rounded-md bg-primary-200 px-2 py-1 text-lg hover:bg-primary-700 hover:text-white focus:bg-primary-700 focus:text-white"
			onclick={onSave}>Publish</button
		>
	</nav>
</header>
