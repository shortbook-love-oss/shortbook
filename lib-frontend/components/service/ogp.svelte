<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { env as envPublic } from '$env/dynamic/public';

	type Props = {
		children?: Snippet;
		pageType: 'website' | 'article' | 'profile';
		title: string;
		description?: string;
	};
	let { children, pageType, title, description = '' }: Props = $props();
</script>

<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
<meta property="og:type" content={pageType} />
<meta property="og:title" content={title} />
{#if description}
	<meta property="og:description" content={description} />
{/if}
<meta
	property="og:image"
	content="{envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/ogp/common/shortbook-ogp?ext=jpeg&q=100&version=0"
/>
<meta property="og:image:type" content="image/jpeg" />
<!-- Specify the size and Facebook crawler will cache the image -->
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="ShortBook" />
<meta property="twitter:card" content="summary_large_image" />
{@render children?.()}
