<script lang="ts">
	import type { Snippet } from 'svelte';
	import Footer from '$lib/components/service/footer/footer.svelte';
	import NavSp from '$lib/components/service/navigation/nav-sp.svelte';
	import Header from '$lib/components/service/header.svelte';

	type Props = {
		alert?: Snippet;
		header?: Snippet;
		footer?: Snippet;
		footerNav?: Snippet;
	} & (
		| {
				contents?: Snippet;
				children?: never;
		  }
		| {
				contents?: never;
				children?: Snippet;
		  }
	);
	let { alert, header, contents, children, footer, footerNav }: Props = $props();
</script>

<div
	class="flex h-dvh w-dvw flex-col overflow-x-hidden font-sans tracking-wide text-stone-950 underline-offset-[0.15em]"
>
	{#if alert}
		{@render alert()}
	{/if}
	{#if header}
		{@render header()}
	{:else}
		<div class="hidden w-full sm:block">
			<Header />
		</div>
	{/if}
	<div class="flex flex-1 flex-col {footerNav ? '' : 'max-sm:pb-[3.75rem]'}">
		{#if contents}
			{@render contents()}
		{:else}
			<div class="flex-1 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
				<main class="min-h-80 w-full flex-1 px-4 pb-24 pt-12 sm:px-8 sm:pt-24">
					{#if children}
						{@render children()}
					{/if}
				</main>
			</div>
			{#if footer}
				{@render footer()}
			{:else}
				<Footer />
			{/if}
		{/if}
	</div>
	{#if footerNav}
		{@render footerNav()}
	{:else}
		<div class="fixed bottom-0 start-0 w-full sm:hidden">
			<NavSp />
		</div>
	{/if}
</div>
