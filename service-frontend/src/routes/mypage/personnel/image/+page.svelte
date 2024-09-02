<script lang="ts">
	import { page } from '$app/stores';
	import ProfileImageUpload from '$lib/components/service/mypage/profile-image-upload.svelte';

	let { data } = $props();

	const user = $page.data.session?.user;
</script>

<svelte:head>
	<title>Change profile image | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Change profile image</h1>
<div class="mb-8 flex flex-wrap items-start gap-4">
	<img
		src="{user?.image}?ext=jpg&w=128&h=128&q=100"
		class="h-32 w-32 rounded-md bg-white"
		alt="Profile icon"
	/>
	<img
		src="{user?.image}?ext=jpg&w=64&h=64&q=100"
		class="h-16 w-16 rounded-md bg-white"
		alt="Profile icon"
	/>
	<img
		src="{user?.image}?ext=jpg&w=32&h=32&q=100"
		class="h-8 w-8 rounded-md bg-white"
		alt="Profile icon"
	/>
</div>
<ProfileImageUpload formData={data.form} actionUrl={$page.url.pathname} className="mb-8" />
