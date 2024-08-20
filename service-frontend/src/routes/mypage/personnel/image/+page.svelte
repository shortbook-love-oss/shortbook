<script lang="ts">
	import { page } from '$app/stores';
	import { env as envPublic } from '$env/dynamic/public';
	import ProfileImageUpload from '$lib/components/service/mypage/profile-image-upload.svelte';

	export let data;

	const user = $page.data.session?.user;
</script>

<svelte:head>
	<title>Change profile image | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Change profile image</h1>
<div class="mb-8 flex flex-wrap items-start gap-4">
	<img
		src="{envPublic.PUBLIC_ORIGIN_PROFILE_IMAGE}{user?.image}?w=128&h=128&fit=cover"
		class="h-32 w-32 rounded-md bg-white"
		alt="Profile icon"
	/>
	<img
		src="{envPublic.PUBLIC_ORIGIN_PROFILE_IMAGE}{user?.image}?w=64&h=64&fit=cover"
		class="h-16 w-16 rounded-md bg-white"
		alt="Profile icon"
	/>
	<img
		src="{envPublic.PUBLIC_ORIGIN_PROFILE_IMAGE}{user?.image}?w=32&h=32&fit=cover"
		class="h-8 w-8 rounded-md bg-white"
		alt="Profile icon"
	/>
</div>
<ProfileImageUpload formData={data.form} actionUrl={$page.url.pathname} className="mb-8" />
