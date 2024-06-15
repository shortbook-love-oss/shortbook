<script lang="ts">
	import { onMount } from 'svelte';
	import { SignOut } from '@auth/sveltekit/components';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	export let dialogName = 'signout';
	let showDialog = false;

	onMount(() => {
		showDialog = true;
	});
</script>

<div>
	<noscript>
		<SignOut className="w-fit rounded-lg hover:bg-stone-200 focus:bg-stone-200">
			<p slot="submitButton" class="px-3 py-2 text-lg text-red-800">Sign out</p>
		</SignOut>
	</noscript>

	<!-- JavaScript enable zone -->
	{#if showDialog}
		<Dialog name={dialogName}>
			<p slot="opener" class="px-3 py-2 text-lg text-red-800">Sign out</p>
			<p class="text-lg">Are you sure you want to sign out?</p>
			<SignOut
				slot="actions"
				className="w-fit rounded-lg mx-auto hover:bg-stone-200 focus:bg-stone-200"
			>
				<p slot="submitButton" class="px-3 py-2 text-xl text-red-800">Sign out</p>
			</SignOut>
		</Dialog>
	{/if}
</div>
