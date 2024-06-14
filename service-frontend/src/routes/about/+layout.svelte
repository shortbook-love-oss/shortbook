<script>
	import LayoutRule from '../_layout-rule.svelte';
</script>

<LayoutRule>
	<div slot="header" class="flex justify-center border-b border-stone-300 px-8 py-4">
		<a href="/" class="w-48">
			<img src="/assets/shortbook-logotype.svg" class="w-full" alt="Short book logo" />
		</a>
	</div>
	<main>
		<slot></slot>
	</main>
	<div slot="footerNav" />
</LayoutRule>
