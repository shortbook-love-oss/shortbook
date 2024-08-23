<script lang="ts">
	import { enhance } from '$app/forms';
	import * as m from '$lib/i18n/paraglide/messages';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	type Props = {
		dialogName?: string;
		openerClass?: string;
	};
	let { dialogName = 'signout', openerClass = 'rounded-md' }: Props = $props();

	function onSignOut() {
		requestAnimationFrame(() => {
			// If auth-only page, redirect to sign-in page by +layout.server.ts
			location.reload();
		});
	}
</script>

<Dialog name={dialogName} {openerClass} dialogSizeClass="max-w-fit">
	{#snippet opener()}
		<p class="w-full px-3 py-2 text-lg text-red-800">{m.signout_label()}</p>
	{/snippet}
	<p>{m.signout_confirm()}</p>
	{#snippet actions()}
		<form method="POST" action="/signout" use:enhance class="mx-auto w-fit" onsubmit={onSignOut}>
			<button
				type="submit"
				class="rounded-md px-3 py-2 text-xl text-red-800 hover:bg-stone-200 focus:bg-stone-200"
			>
				{m.signout_label()}
			</button>
		</form>
	{/snippet}
</Dialog>
