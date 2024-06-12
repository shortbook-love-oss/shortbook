<script>
	export let name = '';
	export let href = '/';
</script>

<a {href} class="inline-block rounded-lg px-3 py-2 hover:bg-stone-200 focus:bg-stone-200">
	<h2 class="text-lg">{name}</h2>
</a>
