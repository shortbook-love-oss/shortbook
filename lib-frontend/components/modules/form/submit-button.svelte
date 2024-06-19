<script lang="ts">
	export let className = '';
</script>

<button class="rounded-lg text-xl border-2 border-primary-700 bg-primary-100 text-primary-950 px-4 py-3 {className}">
	<slot />
</button>
