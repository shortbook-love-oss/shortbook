<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Sign in method | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Sign in method</h1>
<div class="mb-12 inline-flex items-center gap-2 rounded-lg bg-white sm:flex-row">
	<img
		src="/assets/brands/{data.providerName.toLowerCase()}-logo.png"
		class="w-12"
		alt="{data.providerName} logo"
	/>
	<p class="text-xl">Signed in by {data.providerName}</p>
</div>
<p class="mb-1 font-semibold">Signed up at:</p>
<p class="mb-4">{data.userCreatedAt}</p>
<p class="mb-1 font-semibold">Last signed in at:</p>
<p>{data.lastSignedAt}</p>
