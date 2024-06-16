<script>
	import LayoutRule from '../_layout-rule.svelte';
</script>

<LayoutRule>
	<div slot="footer" />
	<main slot="contents" class="flex min-h-full flex-1 flex-col items-center justify-center gap-4">
		<div class="text-center">
			<a href="/" class="inline-block rounded-md p-2 hover:bg-stone-200 focus:bg-stone-200">
				<img
					src="/assets/shortbook-logotype.svg"
					class="aspect-logotype w-full max-w-48"
					alt="Short book logo"
				/>
			</a>
		</div>
		<div class="max-w-xl rounded-xl border border-primary-700 px-4 py-6 sm:px-6 md:px-8">
			<slot></slot>
		</div>
	</main>
</LayoutRule>
