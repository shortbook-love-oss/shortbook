<script>
	import { page } from '$app/stores';

	const user = $page.data.session?.user;
</script>

<svelte:head>
	<title>My page | ShortBook</title>
</svelte:head>

<main>
	<h1 class="mb-4 text-2xl font-semibold">Public profile</h1>
	<div class="flex items-center rounded-lg">
		{#if user?.image}
			<img src={user?.image} class="mr-2 h-16 rounded-md border border-stone-300" alt="Profile" />
		{/if}
		<div>
			<p class="text-xl">{user?.name}</p>
			<p></p>
		</div>
	</div>
</main>
