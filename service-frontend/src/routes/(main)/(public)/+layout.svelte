<script>
	import Nav from '$lib/components/service/navigation/nav.svelte';
	import SubLayout from '../_sublayout.svelte';
</script>

<SubLayout>
	<svelte:fragment slot="nav">
		<Nav />
	</svelte:fragment>
	<slot />
</SubLayout>
