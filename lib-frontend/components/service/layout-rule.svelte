<script lang="ts">
	import Footer from '$lib/components/service/footer/footer.svelte';
	import NavSp from '$lib/components/service/navigation/nav-sp.svelte';
	import Header from '$lib/components/service/header.svelte';
</script>

<div
	class="flex h-dvh w-dvw flex-col overflow-x-hidden font-sans tracking-wide text-stone-950 underline-offset-[0.15em]"
>
	<slot name="alert" />
	<slot name="header">
		<div class="hidden w-full sm:block">
			<Header />
		</div>
	</slot>
	<div class="flex flex-1 flex-col {$$slots.footerNav ? '' : 'max-sm:pb-[3.75rem]'}">
		<slot name="contents">
			<div class="flex-1 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
				<main class="min-h-80 w-full flex-1 px-4 pb-24 pt-12 sm:px-8 sm:pt-24">
					<slot />
				</main>
			</div>
			<slot name="footer">
				<Footer />
			</slot>
		</slot>
	</div>
	<slot name="footerNav">
		<div class="fixed bottom-0 start-0 w-full sm:hidden">
			<NavSp />
		</div>
	</slot>
</div>
