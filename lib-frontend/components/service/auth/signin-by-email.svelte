<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/signin-by-email';
	import Form from '$lib/components/modules/form/form.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';

	export let formData;

	const { form, enhance, validateForm, submitting, message, errors } = superForm(formData, {
		resetForm: false,
		validators: zod(schema)
	});

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	const actionUrl = removeLangTagFromPath($page.url.pathname) + $page.url.search;
</script>

<Form
	method="POST"
	action={actionUrl}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Sign in"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400 ? $message : ''}
>
	<TextField
		bind:value={$form.email}
		name="email"
		label="Email"
		required={true}
		placeholder="your-address@email.example"
		errorMessages={$errors.email}
		className="mb-4"
	/>
</Form>
