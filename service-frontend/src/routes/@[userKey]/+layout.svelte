<script lang="ts">
	import { guessImageTypeByUrl } from '$lib/utilities/file';
	import LayoutRule from '$lib/components/service/layout-rule.svelte';

	export let data;

	const imageContentType = guessImageTypeByUrl(data.user.image ?? '');
</script>

<svelte:head>
	<link rel="icon" href="{data.user.image}?w=32&h=32&fit=cover" />
	<link rel="apple-touch-icon" sizes="180x180" href="{data.user.image}?w=32&h=32&fit=cover" />
	<link
		rel="icon"
		type={imageContentType}
		sizes="32x32"
		href="{data.user.image}?w=32&h=32&fit=cover"
	/>
	<link
		rel="icon"
		type={imageContentType}
		sizes="16x16"
		href="{data.user.image}?w=16&h=16&fit=cover"
	/>
	<meta name="apple-mobile-web-app-title" content={data.profileLang?.pen_name ?? 'ShortBook'} />
	<meta name="application-name" content={data.profileLang?.pen_name ?? 'ShortBook'} />
</svelte:head>

<LayoutRule>
	<slot />
</LayoutRule>
