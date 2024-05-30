<script>
	let yearPeriod = '2024';
	const currentYear = new Date().getFullYear();

	if (currentYear > +yearPeriod) {
		yearPeriod += '-' + currentYear;
	}
</script>

<footer class="justify-center gap-16 p-8 sm:flex">
	<div class="mb-4 sm:pt-1">
		<img src="/shortbook-logotype.svg" class="mb-2 w-48" alt="common.logo_alt" />
		<small class="block text-base">©{yearPeriod} ShortBook</small>
	</div>
	<nav class="text-lg">
		<h2 class="mb-2 font-bold">About</h2>
		<ul class="text-primary-600">
			<li class="mb-2"><a href="/about">common.company_nav.about</a></li>
			<li class="mb-2">
				<a href="https://form.run/@shortbook-contact" target="_blank">common.company_nav.contact</a>
			</li>
		</ul>
	</nav>
</footer>
