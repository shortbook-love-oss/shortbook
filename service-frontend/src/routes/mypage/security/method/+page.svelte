<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Sign in method | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Sign in method</h1>
<div
	class="mb-4 inline-flex items-center gap-2 rounded-lg border border-stone-400 bg-white p-1 py-2 pr-4 sm:flex-row"
>
	<div class="bg-white p-2">
		<img
			src="/assets/brands/{data.providerName.toLowerCase()}-logo.png"
			class="w-12"
			alt="{data.providerName} logo"
		/>
	</div>
	<p class="text-xl">Signed in with {data.providerName}</p>
</div>
<p class="mb-1 font-semibold">Signed up at:</p>
<p class="mb-4">{data.userCreatedAt}</p>
<p class="mb-1 font-semibold">Last signed in at:</p>
<p>{data.lastSignedAt}</p>
