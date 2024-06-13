<script>
	import Nav from '$lib/components/service/mypage/nav.svelte';
	import SubLayout from '../_sublayout.svelte';
</script>

<SubLayout isShowBack>
	<svelte:fragment slot="nav">
		<Nav />
	</svelte:fragment>
	<slot />
</SubLayout>
