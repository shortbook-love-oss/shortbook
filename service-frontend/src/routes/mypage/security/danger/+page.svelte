<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { schema } from '$lib/validation/schema/user/delete';
	import Form from '$lib/components/modules/form/form.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import MessageInfo from '$lib/components/modules/information/message-info.svelte';
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

	const warnMessage =
		'If you delete a user, you can restore them for 30 days by simply signing in. However, after 30 days, user data will be permanently deleted.';
</script>

<svelte:head>
	<title>Danger action | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Danger action — Delete user</h1>
<ProfileCard
	name={$page.data.signInUser.penName}
	imageSrc={$page.data.signInUser.imageSrc}
	className="mb-8"
/>
{#if $page.data.signInUser.isAdmin}
	<MessageInfo message="Can't delete admin-user." />
{:else}
	<Form
		method="POST"
		action={$page.url.pathname}
		{enhance}
		hasInvalid={!hasVaild}
		isLoading={$submitting}
		submitLabel="Delete user"
		{warnMessage}
		errorMessage={400 <= $page.status && $page.status <= 599 ? $message : ''}
	>
		<TextField
			bind:value={$form.keyHandle}
			name="keyHandle"
			label="Type &quot;{$page.data.signInUser.keyHandle}&quot; to delete user data."
			errorMessages={$errors.keyHandle}
			className="mb-8"
		/>
	</Form>
{/if}
