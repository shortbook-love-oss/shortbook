<script lang="ts">
	import LayoutRule from '../_layout-rule.svelte';
</script>

<LayoutRule>
	<div slot="header" />
	<div slot="contents" class="flex min-h-full bg-gradient-to-b from-primary-50/40 to-primary-50">
		<main
			class="flex flex-1 flex-col items-center justify-center gap-4 bg-primary-700 p-4 lg:px-16"
		>
			<div class="mx-auto max-w-md rounded-xl bg-white p-6 pb-10 sm:px-8">
				<div class="mb-8 text-center">
					<a href="/" class="inline-block rounded-md p-2 hover:bg-stone-200 focus:bg-stone-200">
						<img
							src="/assets/shortbook-logotype.svg"
							class="aspect-logotype w-full max-w-48"
							alt="Short book logo"
						/>
					</a>
				</div>
				<slot />
			</div>
		</main>
		<div class="hidden flex-1 flex-col items-center justify-center gap-4 px-16 py-4 lg:flex">
			<div class="mx-auto max-w-md text-4xl">
				<p class="mb-8">Writer first, forever.</p>
				<p>Make writing a habit.</p>
			</div>
		</div>
	</div>
</LayoutRule>
