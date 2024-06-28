<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import IconDelete from '~icons/mdi/trash-can-outline';
	import { page } from '$app/stores';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import { schema } from '$lib/validation/schema/book-update';
	import Dialog from '$lib/components/layouts/dialog.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import SubmitButton from '$lib/components/modules/form/submit-button.svelte';
	import SubmitText from '$lib/components/modules/form/submit-text.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let data;

	const { form, enhance, validateForm, submitting, message, errors } = superForm(data.form, {
		resetForm: false, // Prevents reverting to initial value after submission
		validators: zod(schema),
		validationMethod: 'onblur'
	});
	const actionUrl = removeLangTagFromPath($page.url.pathname) + '?/update';

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = true;
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	const initTitle = data.initTitle;
</script>

<svelte:head>
	<title>Edit book | ShortBook</title>
</svelte:head>

<h1 class="mb-8 text-2xl font-semibold">Edit "{initTitle}"</h1>
<Form
	method="POST"
	action={actionUrl}
	{enhance}
	isLoading={$submitting}
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={$page.status === 400 ? $message : ''}
>
	<TextField
		bind:value={$form.title}
		name="title"
		required={true}
		label="Title"
		errorMessages={$errors.title}
		className="mb-8"
	/>
	<TextField
		bind:value={$form.subtitle}
		name="subtitle"
		label="Subtitle"
		errorMessages={$errors.subtitle}
		className="mb-8"
	/>
	<Select
		bind:value={$form.nativeLanguage}
		name="nativeLanguage"
		list={data.langTags}
		required={true}
		label="Native language"
		errorMessages={$errors.nativeLanguage}
		className="mb-8 max-w-72"
	/>
	<TextArea
		bind:value={$form.prologue}
		name="prologue"
		label="Prologue"
		errorMessages={$errors.prologue}
		className="mb-8"
	/>
	<TextArea
		bind:value={$form.content}
		name="content"
		required={true}
		label="Main content"
		errorMessages={$errors.content}
		className="mb-8"
	/>
	<TextArea
		bind:value={$form.salesMessage}
		name="salesMessage"
		label="&quot;Read this!&quot; appeal"
		errorMessages={$errors.salesMessage}
		className="mb-8"
	/>
	<div slot="submit" class="flex flex-col items-center items-center gap-8 sm:flex-row">
		<SubmitButton hasInvalid={!hasVaild} isLoading={$submitting}>
			{data.status === 0 ? 'Publish book' : 'Republish book'}
		</SubmitButton>
		<Dialog name="delete" openerClass="rounded-lg">
			<NavLinkSmall slot="opener" name="Delete" className="text-red-800">
				<IconDelete width="24" height="24" />
			</NavLinkSmall>
			<p class="mb-2 mt-4 text-lg">Do you want to delete it?</p>
			<SubmitText
				slot="actions"
				formaction="?/delete"
				hasInvalid={!hasVaild}
				isLoading={$submitting}
				className="mx-auto"
			>
				<span class="text-red-800">Delete</span>
			</SubmitText>
		</Dialog>
	</div>
</Form>
