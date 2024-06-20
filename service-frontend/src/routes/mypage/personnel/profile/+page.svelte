<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import { removeLangTag } from '$lib/utilities/url';
	import { schema } from '$lib/validation/scheme/profile-update';

	export let data;

	const { form, enhance, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema),
		onUpdated({ form }) {
			initPenName = form.data.penName;
		}
	});
	const user = $page.data.session?.user;
	const actionUrl = removeLangTag($page.url.pathname);
	let initPenName = $form.penName;
</script>

<svelte:head>
	<title>My page | ShortBook</title>
</svelte:head>

<h1 class="mb-4 text-2xl font-semibold">Public profile</h1>
<div class="mb-8 flex items-center gap-3 rounded-lg">
	{#if user?.image}
		<img
			src={user?.image}
			class="h-16 w-16 rounded-md border border-stone-300"
			alt="Profile icon"
		/>
	{/if}
	<div>
		<p class="text-xl">{initPenName}</p>
	</div>
</div>
<Form
	method="POST"
	action={actionUrl}
	{enhance}
	isLoading={$submitting}
	submitLabel="Save profile"
	successMessage={$message && $page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400
		? 'There was an error, please check your input and resubmit.'
		: ''}
>
	<TextField
		bind:value={$form.slug}
		name="slug"
		required={true}
		label="Slug"
		errorMessages={$errors.slug}
		className="mb-8"
	/>
	<Select
		bind:value={$form.nativeLang}
		name="nativeLang"
		list={data.list.langTags}
		required={true}
		label="Native language"
		errorMessages={$errors.nativeLang}
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
		bind:value={$form.selfIntro}
		name="selfIntro"
		label="Self Intro"
		errorMessages={$errors.selfIntro}
		className="mb-8"
	/>
</Form>
