<script lang="ts">
	import { enhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';

	export let data;

	const { form } = superForm(data.form);
</script>

<svelte:head>
	<title>Sign up / Sign in | ShortBook</title>
</svelte:head>

<form method="POST" action="" use:enhance>
	<label>
		<span>Email</span>
		<input type="email" name="email" bind:value={$form.email} class="border border-primary-600" />
	</label>

	<button class="pa-2 bg-primary-200">Sign up / Sign in</button>
</form>
