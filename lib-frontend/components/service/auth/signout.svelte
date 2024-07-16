<script lang="ts">
	import { SignOut } from '@auth/sveltekit/components';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import * as m from '$lib/i18n/paraglide/messages.js';

	export let dialogName = 'signout';
	export let openerClass = 'rounded-md';

	function onSignOut() {
		// If auth-only page, redirect to sign-in page by +layout.server.ts
		location.reload();
	}
</script>

<Dialog name={dialogName} {openerClass} dialogSizeClass="max-w-fit">
	<p slot="opener" class="w-full px-3 py-2 text-lg text-red-800">{m.signout_label()}</p>
	<p>{m.signout_confirm()}</p>
	<SignOut
		slot="actions"
		className="w-fit rounded-md mx-auto hover:bg-stone-200 focus-within:bg-stone-200"
		on:submit={onSignOut}
	>
		<p slot="submitButton" class="px-3 py-2 text-xl text-red-800">
			{m.signout_label()}
		</p>
	</SignOut>
</Dialog>
