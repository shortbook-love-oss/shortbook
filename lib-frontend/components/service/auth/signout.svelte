<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$i18n/output/messages';
	import { redirectParam } from '$lib/utilities/url';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	type Props = {
		dialogName?: string;
		openerClass?: string;
	};
	let { dialogName = 'signout', openerClass = 'rounded-md' }: Props = $props();

	// After sign-out redirect to
	const redirectUrl = $derived(encodeURIComponent($page.url.href));
</script>

<Dialog name={dialogName} {openerClass} dialogSizeClass="max-w-fit">
	{#snippet opener()}
		<p class="w-full px-3 py-2 text-lg text-red-800">{m.signout_title()}</p>
	{/snippet}
	<p>{m.signout_confirm()}</p>
	{#snippet actions()}
		<div class="flex justify-center">
			<a
				href="/signout?{redirectParam}={redirectUrl}"
				data-sveltekit-reload
				class="rounded-lg px-3 py-2 text-lg text-red-800 hover:bg-stone-200 focus:bg-stone-200"
				>{m.signout_title()}
			</a>
		</div>
	{/snippet}
</Dialog>
