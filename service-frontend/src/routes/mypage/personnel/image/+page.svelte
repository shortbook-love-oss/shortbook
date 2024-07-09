<script lang="ts">
	import { page } from '$app/stores';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import ProfileImageUpload from '$lib/components/service/mypage/profile-image-upload.svelte';

	export let data;

	const user = $page.data.session?.user;
</script>

<svelte:head>
	<title>Change profile image | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Change profile image</h1>
<ProfileCard name={data.penName} imageSrc={user?.image ?? ''} className="mb-8" />
<ProfileImageUpload
	formData={data.form}
	actionUrl={removeLangTagFromPath($page.url.pathname)}
	className="mb-8"
/>
