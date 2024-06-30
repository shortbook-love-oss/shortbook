<script lang="ts">
	import { SignOut } from '@auth/sveltekit/components';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	export let dialogName = 'signout';

	function onSignOut() {
		// If auth-only page, redirect to sign-in page by +layout.server.ts
		location.reload();
	}
</script>

<Dialog name={dialogName} openerClass="rounded-lg">
	<p slot="opener" class="w-full px-3 py-2 text-lg text-red-800">Sign out</p>
	<p>Do you want to sign out?</p>
	<SignOut
		slot="actions"
		className="w-fit rounded-lg mx-auto hover:bg-stone-200 focus-within:bg-stone-200"
		on:submit={onSignOut}
	>
		<p slot="submitButton" class="px-3 py-2 text-xl text-red-800">Sign out</p>
	</SignOut>
</Dialog>
