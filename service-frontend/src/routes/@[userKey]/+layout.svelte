<script lang="ts">
	import LayoutRule from '$lib/components/service/layout-rule.svelte';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="{data.user.image}?ext=jpg&w=32&h=32&q=80" />
	<link rel="apple-touch-icon" sizes="180x180" href="{data.user.image}?ext=jpg&w=32&h=32&q=80" />
	<link
		rel="icon"
		type="image/jpeg"
		sizes="32x32"
		href="{data.user.image}?ext=jpg&w=32&h=32&q=80"
	/>
	<link
		rel="icon"
		type="image/jpeg"
		sizes="16x16"
		href="{data.user.image}?ext=jpg&w=16&h=16&q=80"
	/>
	<meta name="apple-mobile-web-app-title" content={data.profileLang?.pen_name ?? 'ShortBook'} />
	<meta name="application-name" content={data.profileLang?.pen_name ?? 'ShortBook'} />
</svelte:head>

<LayoutRule>
	{@render children()}
</LayoutRule>
