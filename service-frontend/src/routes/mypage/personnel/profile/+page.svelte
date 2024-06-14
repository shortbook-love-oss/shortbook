<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>My page | ShortBook</title>
</svelte:head>

<main>
	<h1 class="mb-4 text-2xl font-semibold">Public profile</h1>
	{#if $page.data.session}
		<div class="flex items-center rounded-lg">
			{#if $page.data.session.user?.image}
				<img
					src={$page.data.session.user?.image}
					class="mr-2 h-16 rounded-md border border-stone-300"
					alt="Profile"
				/>
			{/if}
			<div>
				<p class="text-xl">{$page.data.session.user?.name}</p>
				<p></p>
			</div>
		</div>
	{:else}
		<p>You are not signed in</p>
	{/if}
</main>
