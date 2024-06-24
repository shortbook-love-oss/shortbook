<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import ProfileCard from '$lib/components/service/mypage/profile-card.svelte';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/profile-update';

	export let data;

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema),
		onUpdated: ({ form }) => {
			if (form.valid) {
				initPenName = form.data.penName;
			}
		}
	});

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	const user = $page.data.session?.user;
	const actionUrl = removeLangTagFromPath($page.url.pathname);
	let initPenName = $form.penName;
</script>

<svelte:head>
	<title>Edit my profile | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Public profile</h1>
<ProfileCard name={initPenName} imageSrc={user?.image ?? ''} className="mb-8" />
<Form
	method="POST"
	action={actionUrl}
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel="Save profile"
	successMessage={$page.status === 200 && $message ? $message : ''}
	errorMessage={$page.status === 400
		? 'There was an error, please check your input and resubmit.'
		: ''}
>
	<TextField
		bind:value={$form.keyName}
		name="keyName"
		required={true}
		label="User ID"
		errorMessages={$errors.keyName}
		className="mb-8"
	/>
	<Select
		bind:value={$form.nativeLanguage}
		name="nativeLang"
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
		name="selfIntro"
		label="Self Intro"
		errorMessages={$errors.selfIntroduction}
		className="mb-8"
	/>
</Form>
