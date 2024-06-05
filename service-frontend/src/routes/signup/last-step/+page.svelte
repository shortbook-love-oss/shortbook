<script>
	import { enhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';

	export let data;

	const { form } = superForm(data.form);
</script>

<svelte:head>
	<title>Welcome | ShortBook</title>
</svelte:head>

<form method="POST" action="" use:enhance>
	<label>
		<span>Pen name</span>
		<input
			type="text"
			name="pen_name"
			bind:value={$form.pen_name}
			class="border border-primary-600"
		/>
	</label>
	<label>
		<span>Password</span>
		<input
			type="password"
			name="password"
			bind:value={$form.password}
			class="border border-primary-600"
		/>
	</label>
	<button class="pa-2 bg-primary-200">Become a writer!</button>
</form>
