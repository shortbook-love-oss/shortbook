<script>
	export let name = '';
	export let href = '/';
</script>

<a
	{href}
	class="flex items-center rounded-lg p-3 text-stone-950 hover:bg-stone-200 focus:bg-stone-200"
>
	<div class="mr-2"><slot></slot></div>
	<h2 class="flex-1 text-xl">{name}</h2>
</a>
