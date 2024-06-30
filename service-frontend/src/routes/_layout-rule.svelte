<script>
	import { updated } from '$app/stores';
	import NavSp from '$lib/components/service/navigation/nav-sp.svelte';
	import Footer from '$lib/components/service/footer.svelte';

	export let isNarrow = false;
</script>

<div
	data-sveltekit-reload={$updated}
	class="flex h-dvh h-screen flex-col tracking-wide text-stone-950 underline-offset-[3px]"
>
	<slot name="alert" {isNarrow} />
	<slot name="header" {isNarrow} />
	<div class="flex flex-1 flex-col overflow-x-auto">
		<div class="w-full flex-1">
			<slot name="contents" {isNarrow}>
				<div
					class="mx-auto min-h-80 w-full flex-1 gap-12 px-4 pb-16 pt-12 sm:flex sm:px-6 md:px-8 lg:gap-20 {isNarrow
						? 'max-w-screen-lg'
						: 'max-w-screen-2xl'}"
				>
					{#if $$slots.side}
						<div class="hidden w-48 sm:-ms-3 sm:block">
							<slot name="side" />
						</div>
					{/if}
					<slot></slot>
				</div>
			</slot>
		</div>
		<slot name="footer" {isNarrow}>
			<Footer />
		</slot>
	</div>
	<div class="sm:hidden">
		<slot name="footerNav">
			<NavSp />
		</slot>
	</div>
</div>
