<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { schema } from '$lib/validation/schema/user/email-update';
	import Form from '$lib/components/modules/form/form.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';

	let { data } = $props();

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema)
	});

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = $state(true);
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());
</script>

<svelte:head>
	<title>Email | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Email</h1>
<ProfileCard
	name={$page.data.signInUser.penName}
	imageSrc={$page.data.signInUser.imageSrc}
	className="mb-8"
/>
<p class="mb-1 text-lg">Your current email</p>
<p class="mb-8 break-words text-2xl">{data.currentEmail}</p>
<Form
	method="POST"
	action={$page.url.pathname}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Confirm and change"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={400 <= $page.status && $page.status <= 599 ? $message : ''}
>
	<TextField
		bind:value={$form.email}
		type="email"
		name="email"
		autocomplete="email"
		required={true}
		label="New email address"
		placeholder="your-address@email.example"
		errorMessages={$errors.email}
		className="mb-8"
	/>
</Form>
