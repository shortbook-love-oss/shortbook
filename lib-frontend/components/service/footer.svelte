<script>
	import { categories } from './menu';

	let yearPeriod = '2024';
	const currentYear = new Date().getFullYear();

	if (currentYear > +yearPeriod) {
		yearPeriod += '-' + currentYear;
	}
</script>

<footer class="flex justify-center gap-16 border-t border-stone-300 p-4 sm:px-6 md:px-8">
	<nav class="flex max-w-[90rem] flex-wrap gap-x-16 gap-y-8 text-lg">
		<div class="w-full sm:w-auto sm:pt-1">
			<a href="/" class=" mb-2 block">
				<img
					src="/assets/shortbook-logotype.svg"
					class="aspect-logotype w-48"
					alt="Short book logo"
				/>
			</a>
			<small class="block text-base">© {yearPeriod} ShortBook LLC</small>
		</div>
		{#each categories as category (category.name)}
			<div>
				<h2 class="mb-2 font-bold">{category.name}</h2>
				<ul>
					{#each category.childs as item (item.href)}
						<li class="mb-2">
							<a href="/{item.href}" class="hover:underline">{item.name}</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
</footer>
