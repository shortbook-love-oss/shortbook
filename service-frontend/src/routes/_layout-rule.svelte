<script>
	import NavSp from '$lib/components/service/navigation/nav-sp.svelte';
	import Footer from '$lib/components/service/footer.svelte';
</script>

<div class="flex h-dvh h-screen flex-col text-stone-950 tracking-wide">
	<slot name="alert" />
	<slot name="header" />
	<div class="flex flex-1 flex-col overflow-x-auto">
		<div class="flex-1">
			<slot name="contents">
				<div
					class="mx-auto w-full max-w-[90rem] flex-1 gap-12 px-4 pb-16 pt-12 sm:flex sm:px-6 md:px-8 lg:gap-20"
				>
					{#if $$slots.side}
						<div class="hidden w-48 sm:block">
							<slot name="side" />
						</div>
					{/if}
					<slot></slot>
				</div>
			</slot>
		</div>
		<slot name="footer">
			<Footer />
		</slot>
	</div>
	<div class="sm:hidden">
		<slot name="footerNav">
			<NavSp />
		</slot>
	</div>
</div>
