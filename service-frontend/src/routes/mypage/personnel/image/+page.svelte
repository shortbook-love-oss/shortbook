<script lang="ts">
	import { page } from '$app/stores';
	import ProfileImageUpload from '$lib/components/service/mypage/profile-image-upload.svelte';

	let { data } = $props();

	const user = $page.data.signInUser;
</script>

<svelte:head>
	<title>Change profile image | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Change profile image</h1>
<div class="mb-8 flex flex-wrap items-start gap-4">
	<picture>
		<source srcset="{user.imageSrc}?ext=avif&w=128&h=128&q=80" type="image/avif" />
		<img
			src="{user.imageSrc}?ext=png&w=128&h=128&q=80"
			class="h-32 w-32 rounded-md bg-white"
			alt="Profile icon"
		/>
	</picture>
	<picture>
		<source srcset="{user.imageSrc}?ext=avif&w=64&h=64&q=80" type="image/avif" />
		<img
			src="{user.imageSrc}?ext=png&w=64&h=64&q=80"
			class="h-16 w-16 rounded-md bg-white"
			alt="Profile icon"
		/>
	</picture>
	<picture>
		<source srcset="{user.imageSrc}?ext=avif&w=32&h=32&q=80" type="image/avif" />
		<img
			src="{user.imageSrc}?ext=png&w=32&h=32&q=80"
			class="h-8 w-8 rounded-md bg-white"
			alt="Profile icon"
		/>
	</picture>
</div>
<ProfileImageUpload formData={data.form} actionUrl={$page.url.pathname} className="mb-8" />
