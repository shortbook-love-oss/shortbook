<script lang="ts">
	import * as m from '$lib/i18n/paraglide/messages';
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	{#snippet header()}
		<div></div>
	{/snippet}
	{#snippet contents()}
		<div class="flex min-h-full bg-gradient-to-b from-primary-50/40 to-primary-50">
			<main
				class="flex flex-1 flex-col items-center justify-center gap-6 bg-primary-700 p-4 lg:px-16"
			>
				<div class="inline-block w-full max-w-md rounded-xl bg-white p-6 pb-10 sm:px-8">
					<div class="mb-6 text-center">
						<a
							href="/"
							class="inline-block rounded-md p-2 align-middle hover:bg-stone-200 focus:bg-stone-200"
							data-sveltekit-reload
						>
							<img
								src="/assets/shortbook-logotype.svg"
								class="aspect-logotype h-6"
								alt="Short book logo"
							/>
						</a>
					</div>
					{@render children()}
				</div>
				<div class="flex flex-wrap items-center gap-x-6 gap-y-4 text-white">
					<a href="/policies/term" target="_blank" class="underline"
						>{m.footer_about_shortbook_term()}</a
					>
					<a href="/policies/privacy" target="_blank" class="underline"
						>{m.footer_about_shortbook_privacy()}</a
					>
				</div>
			</main>
			<div class="hidden flex-1 flex-col items-center justify-center gap-4 px-16 py-4 lg:flex">
				<div class="mx-auto max-w-md text-4xl">
					<p class="mb-8">Writer first, forever.</p>
					<p>Make writing a habit.</p>
				</div>
			</div>
		</div>
	{/snippet}
	{#snippet footerNav()}
		<div></div>
	{/snippet}
</LayoutRule>
