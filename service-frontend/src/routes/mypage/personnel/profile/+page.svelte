<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { schema } from '$lib/validation/schema/user/profile/update.js';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';

	let { data } = $props();

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema),
		onUpdated: ({ form }) => {
			if (form.valid) {
				initForm = { ...form.data };
			}
		}
	});
	let initForm = $state({} as typeof $form);
	initForm = { ...$form };

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
	<title>Edit my profile | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Public profile</h1>
<ProfileCard
	name={initForm.penName}
	keyHandle={initForm.keyHandle}
	imageSrc={$page.data.signInUser.imageSrc}
	className="mb-8"
>
	{#if initForm.headline}
		<p class="mt-1 whitespace-pre-wrap">{initForm.headline}</p>
	{/if}
</ProfileCard>
<Form
	method="POST"
	action={$page.url.pathname}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Save profile"
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400 ? $message : ''}
>
	<TextField
		bind:value={$form.keyHandle}
		name="keyHandle"
		required={true}
		label="User ID"
		errorMessages={$errors.keyHandle}
		className="mb-8"
	/>
	<Select
		bind:value={$form.nativeLanguage as string}
		name="nativeLanguage"
		list={data.langTags}
		required={true}
		label="Native language"
		errorMessages={$errors.nativeLanguage}
		className="mb-8 max-w-72"
	/>
	<TextField
		bind:value={$form.penName}
		name="penName"
		required={true}
		label="Pen name"
		errorMessages={$errors.penName}
		className="mb-8"
	/>
	<TextField
		bind:value={$form.headline}
		name="headline"
		label="Headline"
		errorMessages={$errors.headline}
		className="mb-8"
	/>
	<TextArea
		bind:value={$form.selfIntroduction}
		name="selfIntroduction"
		label="Self introduction"
		errorMessages={$errors.selfIntroduction}
		className="mb-8"
	/>
</Form>
