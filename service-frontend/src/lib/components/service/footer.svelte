<script lang="ts">
	import { t } from '$lib/translations/translations';

	let yearPeriod = '2024';
	const currentYear = new Date().getFullYear();

	if (currentYear > +yearPeriod) {
		yearPeriod += '-' + currentYear;
	}
</script>

<footer class="justify-center gap-16 sm:flex">
	<div class="mb-4">
		<img src="/shortbook-logotype.svg" class="mb-2 w-36" alt={$t('common.logo_alt')} />
		<small class="block text-xs">©{yearPeriod} {$t('common.company_name')}</small>
	</div>
	<nav class="text-lg">
		<h2 class="mb-2 font-bold">About</h2>
		<ul class="text-primary-600">
			<li class="mb-2"><a href="/about">{$t('common.company_nav.about')}</a></li>
			<li class="mb-2">
				<a href="https://form.run/@shortbook-contact" target="_blank"
					>{$t('common.company_nav.contact')}</a
				>
			</li>
		</ul>
	</nav>
</footer>
