<script>
	let yearPeriod = '2024';
	const currentYear = new Date().getFullYear();

	if (currentYear > +yearPeriod) {
		yearPeriod += '-' + currentYear;
	}
</script>

<footer class="justify-center gap-16 border-t border-stone-300 p-8 sm:flex">
	<div class="mb-8 sm:pt-1">
		<img
			src="/assets/shortbook-logotype.svg"
			class="mb-2 aspect-logotype w-48"
			alt="common.logo_alt"
		/>
		<small class="block text-base">© {yearPeriod} ShortBook LLC</small>
	</div>
	<nav class="text-lg">
		<h2 class="mb-2 font-bold">About</h2>
		<ul class="text-primary-600">
			<li class="mb-2"><a href="/about">About</a></li>
			<li class="mb-2">
				<a href="https://form.run/@shortbook-contact" target="_blank">Contact</a>
			</li>
		</ul>
	</nav>
</footer>
