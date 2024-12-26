<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { superForm, filesProxy } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import * as m from '$i18n/output/messages';
	import { schema } from '$lib/validation/schema/support/ticket-create';
	import File from '$lib/components/modules/form/file.svelte';
	import Form from '$lib/components/modules/form/form.svelte';
	import Select from '$lib/components/modules/form/select.svelte';
	import TextArea from '$lib/components/modules/form/text-area.svelte';
	import TextField from '$lib/components/modules/form/text-field.svelte';
	import Ogp from '$lib/components/service/ogp.svelte';

	let { data } = $props();

	const { form, enhance, capture, restore, validateForm, submitting, message, errors } = superForm(
		data.form,
		{ validators: zod(schema) }
	);
	export const snapshot = { capture, restore };
	const filesAttach = filesProxy(form, 'files' as never);

	// Validate and set enable/disable submit button when the input value changes
	let hasVaild = $state(true);
	function validateBackground() {
		validateForm().then((result) => (hasVaild = result.valid));
	}
	const formObserver = form.subscribe(() => validateBackground());
	onMount(() => validateBackground());
	onDestroy(() => formObserver());

	const selectedCategory = $derived.by(() => {
		return data.contactCategories.find((category) => category.value === $form.category);
	});
</script>

<svelte:head>
	<title>{m.contact_title()} | ShortBook</title>
	<Ogp pageType="website" title="ShortBook — {m.contact_title()}" />
</svelte:head>

<section class="mx-auto mb-8 max-w-xl text-lg">
	<h1 class="mb-8 text-4xl font-semibold">{m.contact_title()}</h1>
	<p>{m.contact_introduction()}</p>
</section>
<Form
	method="POST"
	action={$page.url.pathname + $page.url.search}
	enctype="multipart/form-data"
	{enhance}
	hasInvalid={!hasVaild}
	isLoading={$submitting}
	submitLabel={m.contact_submit_label()}
	successMessage={$page.status === 200 ? $message : ''}
	errorMessage={400 <= $page.status && $page.status <= 599 ? $message : ''}
	class="mx-auto max-w-xl"
>
	<Select
		bind:value={$form.category as string}
		name="category"
		list={data.contactCategories}
		label={m.contact_input_label_category()}
		errorMessages={$errors.category}
		className="max-w-[28rem] {selectedCategory?.notice ? 'mb-2' : 'mb-8'}"
	/>
	{#if selectedCategory?.notice}
		<div class="mb-8">
			{#each selectedCategory.notice.split('\n') as noticeLine}
				<p class="mb-2">{noticeLine}</p>
			{/each}
		</div>
	{/if}
	<TextField
		bind:value={$form.personName}
		name="personName"
		autocomplete="name"
		required={true}
		label={m.contact_input_label_person_name()}
		errorMessages={$errors.personName}
		className="mb-8 max-w-[28rem]"
	/>
	<TextField
		bind:value={$form.email}
		type="email"
		name="email"
		autocomplete="email"
		required={true}
		label={m.contact_input_label_email()}
		placeholder="your-address@email.example"
		errorMessages={$errors.email}
		className="mb-8"
	/>
	<TextArea
		bind:value={$form.description}
		name="description"
		required={true}
		label={m.contact_input_label_message()}
		errorMessages={$errors.description}
		className="mb-8"
	/>
	<File
		filesProxy={filesAttach}
		name="files"
		label={m.contact_input_label_file()}
		multiple={true}
		maxSize={20}
		errorMessages={$errors.files}
		className="mb-8 w-full max-w-[28rem]"
	/>
	{#if data.isHitLimitRate}
		<p class="mb-8">{m.contact_limit_rate_over_notice()}</p>
	{/if}
</Form>
