<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>My page | ShortBook</title>
</svelte:head>

<main>
	<h1 class="font-bold mb-4">My page</h1>
	<a href="/" class="mb-4">Top</a>
	{#if $page.data.session}
		<p>Signed in as {$page.data.session.user?.name ?? 'User'}</p>
		<p>Session expiry: {$page.data.session?.expires}</p>
	{:else}
		<p>You are not signed in</p>
	{/if}
</main>
