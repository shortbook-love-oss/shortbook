<script lang="ts">
	import { SignOut } from '@auth/sveltekit/components';
	import * as m from '$lib/i18n/paraglide/messages';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	type Props = {
		dialogName?: string;
		openerClass?: string;
	};
	let { dialogName = 'signout', openerClass = 'rounded-md' }: Props = $props();

	function onSignOut() {
		// If auth-only page, redirect to sign-in page by +layout.server.ts
		location.reload();
	}
</script>

<Dialog name={dialogName} {openerClass} dialogSizeClass="max-w-fit">
	{#snippet opener()}
		<p class="w-full px-3 py-2 text-lg text-red-800">{m.signout_label()}</p>
	{/snippet}
	<p>{m.signout_confirm()}</p>
	{#snippet actions()}
		<SignOut
			className="w-fit rounded-md mx-auto hover:bg-stone-200 focus-within:bg-stone-200"
			on:submit={onSignOut}
		>
			<p slot="submitButton" class="px-3 py-2 text-xl text-red-800">
				{m.signout_label()}
			</p>
		</SignOut>
	{/snippet}
</Dialog>
